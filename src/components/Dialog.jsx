import {useRef, useEffect, useState} from 'react';

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
    {children}
    {button && <div className="button-list"><button type="button" onClick={close}>{button}</button></div>}
  </dialog>);
}
