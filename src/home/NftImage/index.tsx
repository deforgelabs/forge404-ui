import * as C from '../style';
import config from '../../config.json';
import { useEffect, useRef } from 'react';

const images = config.images;

export const NftImage = () => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      let index = 0;
      const interval = setInterval(() => {
        ref.current?.childNodes?.forEach?.((child, i, arr) => {
          if (index !== i) {
            (child as HTMLDivElement).style.display = 'none';
          } else {
            (child as HTMLDivElement).style.display = 'block';
          }
        });
        index = index === images.length - 1 ? 0 : index + 1;
      }, 1000);

      return () => {
        clearInterval(interval);
      };
    }
  }, []);

  return (
    <div style={{ width: '100%' }} ref={ref}>
      {images.map((i, index) => (
        <C.Image key={i} style={index !== 0 ? { display: 'none' } : {}}>
          <img src={`/images/${i}`} alt="launch" />
        </C.Image>
      ))}
    </div>
  );
};
