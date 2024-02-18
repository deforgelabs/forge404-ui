import * as C from './style';
import config from 'config.json';
import {
  useAccount,
  useBalance,
  useReadContract,
  useReadContracts,
  useWriteContract,
} from 'wagmi';
import BigNumber from 'bignumber.js';
import { useEffect, useMemo, useRef, useState } from 'react';
import { BG } from './Bg';
import { Header } from './Header';
import { Loading } from './Loading';
import { BaseInfo } from './BaseInfo';
import { Phase, Phases } from './Phases';
import { useDecimalsSymbol } from './use-decimals-symbol';
import { forge404Contracts, forgeCoreContracts } from './contracts';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { MerkleTree } from 'merkletreejs';
import toast from 'react-hot-toast';
import { keccak256, hexToBytes } from 'viem';
import { NftImage } from './NftImage';

const Home = () => {
  const [showMintedNfts, setShowMintedNfts] = useState(false);

  const [currentPhase, setCurrentPhase] = useState<Phase>();

  const [myNfts, setMyNfts] = useState<{ name: string; image: string }[]>([]);

  const [amount, setAmount] = useState(1);

  const { decimals, symbol, isLoading: decimalLoading } = useDecimalsSymbol();

  const { address } = useAccount();

  const { data } = useBalance({ address });

  const balance = data?.value;

  const walletWhitelisted = address
    ? currentPhase?.whitelist?.includes?.(address)
    : false;

  const {
    data: saleCountData,
    isLoading: saleCountDataLoading,
    refetch: refetchSaleCount,
  } = useReadContracts({
    contracts: [
      {
        ...forgeCoreContracts,
        functionName: 'maxSaleCounts',
        args: [forge404Contracts.address],
      },
      {
        ...forgeCoreContracts,
        functionName: 'saleCounts',
        args: [forge404Contracts.address],
      },
      {
        ...forgeCoreContracts,
        functionName: 'isSoldOut',
        args: [forge404Contracts.address],
      },
      {
        ...forge404Contracts,
        functionName: 'owned',
        args: [address as `0x${string}`],
      },
    ],
    query: {
      refetchInterval: 5000,
    },
  });

  const maxSaleCounts = saleCountData?.[0]?.result;

  const saleCounts = saleCountData?.[1]?.result;

  const isSoldOut = saleCountData?.[2]?.result;

  const nftIds = saleCountData?.[3]?.result || [];

  const {
    data: nftsData,
    refetch: refetchNfts,
    isLoading: nftsLoading,
  } = useReadContracts({
    contracts: nftIds.map((id, index) => {
      return {
        ...forge404Contracts,
        functionName: 'tokenURI',
        args: [id],
      } as const;
    }),
    query: {
      refetchInterval: 5000,
      enabled: nftIds.length > 0,
    },
  });

  useEffect(() => {
    const nftsRes = nftsData?.map?.((r) => r.result) || [];

    Promise.all(
      nftsRes.map((nftData, index) => {
        if (!nftData) return Promise.resolve({});
        try {
          const json = JSON.parse(
            nftData.replace('data:application/json;utf8,', '')
          );
          return Promise.resolve(json);
        } catch (e) {
          return fetch(nftData).then((res) => res.json());
        }
      })
    ).then((data: any) => {
      setMyNfts(data);
    });
  }, [nftsData]);

  console.log({ nftIds, nftsData, myNfts });

  const {
    data: groupsData,
    isLoading: groupsLoading,
    refetch: refetchGroups,
  } = useReadContracts({
    contracts: config.groups.map((g) => {
      return {
        ...forgeCoreContracts,
        functionName: 'groups',
        args: [forge404Contracts.address, g.name],
      };
    }),
    query: {
      refetchInterval: 5000,
    },
  });

  const { data: userBuyCountsData, isLoading: userBugCountsLoading } =
    useReadContract({
      ...forgeCoreContracts,
      functionName: 'userBuyCounts',
      args: [
        forge404Contracts.address,
        currentPhase?.name as string,
        address as `0x${string}`,
      ],
      query: {
        enabled: !!currentPhase?.name && !!address,
      },
    });

  const buyCounts = new BigNumber(
    userBuyCountsData?.toString?.() || 0
  ).toNumber();

  console.log({ buyCounts });

  const phases = useMemo(() => {
    const groups =
      groupsData?.map?.((g) => {
        return g.result as unknown as [
          bigint,
          bigint,
          bigint,
          bigint,
          `0x${string}`
        ];
      }) || [];

    const phases = groups.map((g, index) => {
      return {
        name: config.groups[index].name,
        start_time: new BigNumber(g[0].toString()).times(1000).toString(),
        end_time: new BigNumber(g[1].toString()).times(1000).toString(),
        unit_price: g[2].toString(),
        max_tokens: new BigNumber(g[3].toString()).toNumber(),
        merkle_root: g[4],
        whitelist: config.groups[index].allowlist as `0x${string}`[],
      };
    });

    return phases;
  }, [groupsData]);

  const isSetCurrentPhaseRef = useRef(false);

  console.log({ phases });

  useEffect(() => {
    if (!isSetCurrentPhaseRef.current) {
      setCurrentPhase(phases[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phases]);

  const loading =
    saleCountDataLoading ||
    groupsLoading ||
    decimalLoading ||
    nftsLoading ||
    userBugCountsLoading;

  const { openConnectModal } = useConnectModal();

  const { writeContractAsync } = useWriteContract();

  const mint = () => {
    if (!address) {
      openConnectModal?.();
    }

    if (currentPhase && Number(amount) > 0) {
      //check if amount is larger than max tokens
      if (currentPhase.max_tokens > 0 && amount > currentPhase.max_tokens) {
        toast.error(
          'You can only mint ' + currentPhase.max_tokens + ' tokens per wallet'
        );
        return;
      }

      //check if amount is larger than remaining tokens
      if (
        typeof maxSaleCounts === 'number' &&
        typeof saleCounts === 'number' &&
        amount > maxSaleCounts - saleCounts
      ) {
        toast.error(
          'There are only ' + (maxSaleCounts - saleCounts) + ' tokens left'
        );
        return;
      }

      //check if current phase is active
      if (
        Number(currentPhase.start_time) !== 0 &&
        new Date(Number(currentPhase.start_time)) > new Date()
      ) {
        toast.error('This phase has not started yet');
        return;
      }
      //check if current phase has ended
      if (
        Number(currentPhase.end_time) !== 0 &&
        new Date(Number(currentPhase.end_time)) < new Date()
      ) {
        toast.error('This phase has ended');
        return;
      }

      //check if wallet have enough balance
      if (
        Number(currentPhase.unit_price) > 0 &&
        new BigNumber(currentPhase.unit_price)
          .times(amount)
          .gt(new BigNumber(balance?.toString() || 0))
      ) {
        // debugger;
        toast.error('Insufficient balance');
        return;
      }

      if (address) {
        let hashedWallets = (currentPhase.whitelist || [])
          .map((item) => hexToBytes(item))
          .map((item) => keccak256(item));

        // Generate Merkle tree
        const tree = new MerkleTree(hashedWallets, keccak256, {
          sortPairs: true,
        });
        const merkleRoot = tree.getRoot().toString('hex');

        // Generate Merkle proof
        const merkleProof = tree
          .getProof(keccak256(hexToBytes(address)))
          .map((x) => '0x' + x.data.toString('hex'));

        console.log({ merkleProof, merkleRoot });

        let loading = toast.loading('Minting...');

        writeContractAsync({
          ...forgeCoreContracts,
          functionName: 'forge404',
          args: [
            forge404Contracts.address,
            currentPhase.name,
            amount,
            merkleProof as [],
          ],
          value: BigInt(
            new BigNumber(currentPhase.unit_price).times(amount).toString()
          ),
        })
          .then((res) => {
            console.log({ res });
            toast.dismiss(loading);
            toast.success('Minted successfully');
            refetchSaleCount();
            refetchGroups();
            refetchNfts();
          })
          .catch((e) => {
            toast.dismiss(loading);
            //   if (e.message.includes('Max Tokens Minted'))
            //     toast.error(
            //       'You can only mint ' +
            //         currentPhase.max_tokens +
            //         ' tokens per wallet for this phase'
            //     );
            //   else if (e.message !== 'Transaction declined')
            toast.error('Mint failed');

            console.log(e);
          });
      }
    }
  };

  const haveMaxAmount = currentPhase?.max_tokens
    ? currentPhase?.max_tokens - buyCounts
    : 0;

  useEffect(() => {
    setAmount(1);
  }, [haveMaxAmount]);

  return (
    <C.Home>
      <BG />
      <C.Container>
        <Header />
        <C.Launch showMintedNfts={showMintedNfts ? 'true' : 'false'}>
          {loading ? (
            <Loading />
          ) : (
            <>
              <C.LaunchBg />
              {showMintedNfts ? (
                <C.MintedNfts>
                  <C.MintedNftsHeader>
                    <C.GoBack onClick={() => setShowMintedNfts(false)}>
                      Back
                    </C.GoBack>
                  </C.MintedNftsHeader>
                  <C.MintedNftsBody>
                    {myNfts.map((mint, i) => (
                      <C.Nft key={i}>
                        <C.NftImage src={`${mint?.image}`}></C.NftImage>
                        <C.NftTitle>{mint?.name}</C.NftTitle>
                      </C.Nft>
                    ))}
                  </C.MintedNftsBody>
                </C.MintedNfts>
              ) : (
                <>
                  <C.LaunchInfo>
                    <BaseInfo
                      maxSaleCounts={maxSaleCounts}
                      saleCounts={saleCounts}
                    />
                    <Phases
                      phases={phases}
                      currentPhase={currentPhase}
                      setCurrentPhase={setCurrentPhase}
                    />
                  </C.LaunchInfo>
                  <C.Mid></C.Mid>
                  <C.LaunchMint>
                    <C.TitleMobile>{config.name}</C.TitleMobile>
                    <NftImage />
                    <C.MintInfo>
                      <C.Price>
                        Price:{' '}
                        <span>
                          {currentPhase && decimals && symbol
                            ? new BigNumber(currentPhase?.unit_price)
                                .div(decimals ? 10 ** decimals : 1)
                                .times(
                                  isNaN(Number(amount)) ? 1 : Number(amount)
                                )
                                .toString()
                            : ''}{' '}
                          {symbol}
                        </span>
                      </C.Price>
                      <C.Amount>
                        <C.AmountButton
                          onClick={() => {
                            setAmount((amount) =>
                              amount > 1 ? amount - 1 : 1
                            );
                          }}
                        >
                          &minus;
                        </C.AmountButton>
                        <C.AmountValue
                          type="number"
                          step="1"
                          min={1}
                          max={haveMaxAmount}
                          value={amount}
                          onBlur={(e) => {
                            const value = Number(e.target.value);
                            if (isNaN(value) || value < 1) {
                              setAmount(1);
                            } else if (currentPhase && value > haveMaxAmount) {
                              setAmount(haveMaxAmount);
                            } else {
                              setAmount(value);
                            }
                          }}
                          onChange={(e) => {
                            setAmount(e.target.value as unknown as number);
                          }}
                        />
                        <C.AmountButton
                          onClick={() => {
                            setAmount((amount) => {
                              return amount + 1 > haveMaxAmount
                                ? haveMaxAmount
                                : amount + 1;
                            });
                          }}
                        >
                          &#43;
                        </C.AmountButton>
                        <C.AmountMax
                          onClick={() => {
                            setAmount(haveMaxAmount);
                          }}
                        >
                          max
                        </C.AmountMax>
                      </C.Amount>
                    </C.MintInfo>
                    <C.MintButton
                      onClick={mint}
                      disabled={
                        (currentPhase?.merkle_root &&
                          Number(currentPhase.merkle_root) !== 0 &&
                          !walletWhitelisted) ||
                        isSoldOut ||
                        (currentPhase && buyCounts >= currentPhase?.max_tokens)
                      }
                    >
                      {isSoldOut ? (
                        <>Sold Out!</>
                      ) : (
                        <>
                          {currentPhase?.merkle_root &&
                          Number(currentPhase.merkle_root) !== 0 &&
                          !walletWhitelisted
                            ? 'Not Whitelisted'
                            : currentPhase &&
                              buyCounts >= currentPhase?.max_tokens
                            ? 'Max Tokens Minted'
                            : 'Mint'}
                        </>
                      )}
                    </C.MintButton>
                    {nftIds.length > 0 && (
                      <C.MintedBalance
                        onClick={() => {
                          setShowMintedNfts(true);
                        }}
                      >
                        You have minted <span>{nftIds.length}</span>{' '}
                        {nftIds.length === 1 ? 'NFT' : 'NFTs'}
                      </C.MintedBalance>
                    )}
                  </C.LaunchMint>
                </>
              )}
            </>
          )}
        </C.Launch>
      </C.Container>
    </C.Home>
  );
};

export default Home;
