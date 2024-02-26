import {useRef, useEffect, useState} from 'react';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';

export default function Dialog({ show, setShow, children, button }) {
  const [className, setClassName] = useState('');
  const elRef = useRef();
  useEffect(() => {
    const handleOutsideClick = (event) => {
      const rect = elRef.current.getBoundingClientRect();
      const isInDialog=(rect.top <= event.clientY && event.clientY <= rect.top + rect.height
        && rect.left <= event.clientX && event.clientX <= rect.left + rect.width);
      // Fix for Firefox
      if(event.target.nodeName === 'OPTION') return;
      if (!isInDialog) {
        close();
      }
    };
    if(show && !elRef.current.open) {
      setClassName('');
      elRef.current.showModal();
      setTimeout(() => {
        setClassName('fade-open');
      }, 0);
      document.addEventListener('mousedown', handleOutsideClick);
    } else if(!show) elRef.current.close();

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
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
