import * as C from '../style';
import config from '../../config.json';
import {
  faTwitter,
  faDiscord,
  faTelegram,
} from '@fortawesome/free-brands-svg-icons';
import { faGlobe } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FC } from 'react';

export const BaseInfo: FC<{
  maxSaleCounts: number | undefined;
  saleCounts: number | undefined;
}> = ({ maxSaleCounts, saleCounts }) => {
  return (
    <>
      <C.Title>{config.name}</C.Title>
      <C.TotalMinted>
        <C.TotalMintedInfo>
          <C.TotalMintedTitle>TOTAL MINTED</C.TotalMintedTitle>
          <C.TotalMintedValue>
            {typeof saleCounts === 'number' && typeof maxSaleCounts === 'number'
              ? Math.floor((saleCounts / maxSaleCounts) * 100 * 100) / 100
              : ''}
            % <span>{saleCounts + '/' + maxSaleCounts}</span>
          </C.TotalMintedValue>
        </C.TotalMintedInfo>
        <C.TotalMintedProgress
          value={
            typeof saleCounts === 'number' && typeof maxSaleCounts === 'number'
              ? Math.floor((saleCounts / maxSaleCounts) * 100 * 100) / 100
              : 0
          }
        ></C.TotalMintedProgress>
      </C.TotalMinted>

      <C.Description>{config.description}</C.Description>

      {(config.website ||
        config.twitter ||
        config.discord ||
        config.telegram) && (
        <C.Links>
          {config.website && (
            <C.Link href={config.website} target="_blank" rel="noreferrer">
              <FontAwesomeIcon icon={faGlobe} />
            </C.Link>
          )}
          {config.twitter && (
            <C.Link href={config.twitter} target="_blank" rel="noreferrer">
              <FontAwesomeIcon icon={faTwitter} />
            </C.Link>
          )}
          {config.discord && (
            <C.Link href={config.discord} target="_blank" rel="noreferrer">
              <FontAwesomeIcon icon={faDiscord} />
            </C.Link>
          )}
          {config.telegram && (
            <C.Link href={config.telegram} target="_blank" rel="noreferrer">
              <FontAwesomeIcon icon={faTelegram} />
            </C.Link>
          )}
        </C.Links>
      )}
    </>
  );
};
