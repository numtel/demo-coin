import {useRef, useEffect, useState} from 'react';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';

export default function Dialog({ show, setShow, children, button }) {
  const [className, setClassName] = useState('');
  const elRef = useRef();
  useEffect(() => {
    if(show && !elRef.current.open) {
      setClassName('');
      elRef.current.showModal();
      setTimeout(() => {
        setClassName('fade-open');
      }, 0);
    } else if(!show) elRef.current.close();
  }, [show]);
  function close() {
    setClassName('');
    setTimeout(() => {
      setShow(0);
      elRef.current.close();
    }, 100);
  }
  return (<dialog ref={elRef} className={className} onClose={close}>
    {button && <div className="button-list"><button type="button" title={button} onClick={close}><FontAwesomeIcon icon={faXmark} /></button></div>}
    {children}
  </dialog>);
}
