import * as C from '../style';
import { Dispatch, FC, SetStateAction } from 'react';
import BigNumber from 'bignumber.js';
import { Timer } from 'components/timer';
import { useDecimalsSymbol } from 'home/use-decimals-symbol';

export type Phase = {
  name: string;
  start_time: string;
  end_time: string;
  unit_price: string;
  max_tokens: number;
  merkle_root: `0x${string}`;
  whitelist: `0x${string}`[];
};

export const Phases: FC<{
  currentPhase?: Phase;
  setCurrentPhase: Dispatch<SetStateAction<Phase | undefined>>;
  phases: Phase[];
}> = ({ currentPhase, setCurrentPhase, phases }) => {
  const { decimals, symbol } = useDecimalsSymbol();

  return (
    <C.Phases>
      {phases.map((phase, index) => (
        <C.Phase
          key={index}
          active={currentPhase?.name === phase.name ? 'true' : 'false'}
          switch={new Date(Number(phase.end_time)) > new Date() ? 'true' : 'false'}
          onClick={() => {
            if (phase.name !== currentPhase?.name) {
              setCurrentPhase(phase);
            }
          }}
        >
          <C.PhaseTop>
            <C.PhaseTitle>{phase.name}</C.PhaseTitle>
            {
              <>
                {new Date(Number(phase.start_time)) < new Date() &&
                  new Date(Number(phase.end_time)) > new Date() && (
                    <C.PhaseDate>
                      <span>Ends In</span> <Timer date={new Date(Number(phase.end_time))} />
                    </C.PhaseDate>
                  )}
              </>
            }
            {Number(phase.start_time)!==0 &&  new Date(Number(phase.start_time)) > new Date() && (
              <C.PhaseDate>
                <span>Starts In</span> <Timer date={new Date(Number(phase.start_time))} />
              </C.PhaseDate>
            )}
          </C.PhaseTop>
          <C.PhaseBottom>
            {phase.max_tokens > 0 ? phase.max_tokens + ' Per Wallet •' : ''}{' '}
            {decimals && symbol
              ? new BigNumber(phase.unit_price)
                  .div(decimals ? 10 ** decimals : 1)
                  .toString() +
                ' ' +
                symbol
              : ''}
          </C.PhaseBottom>
          {Number(phase.end_time) !== 0 &&
            new Date(Number(phase.end_time)) < new Date() && (
              <C.PhaseBadge>Ended</C.PhaseBadge>
            )}
        </C.Phase>
      ))}
    </C.Phases>
  );
};
