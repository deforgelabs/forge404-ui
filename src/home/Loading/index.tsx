import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleNotch } from '@fortawesome/free-solid-svg-icons';
import * as C from '../style';

export const Loading = () => {
  return (
    <C.Loading>
      <FontAwesomeIcon icon={faCircleNotch} spin />
    </C.Loading>
  );
};
