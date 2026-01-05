import React, { useEffect, useState, useRef } from 'react';
import cls from './style.module.scss'
import { IMaskInput } from 'react-imask';


export default ({ title = null, onValid = () => { }, name = null, min = null, max = null, value = '', type = 'text', setter = () => { }, ...props }) => {
  const [validMessage, setValidMessage] = useState('')
  const ref = useRef(null);

  useEffect(() => {

    if (typeof onValid == 'function' && name) onValid(prev => {
      const findItem = prev.find(el => el.name == name);  
      const valid = validMessage ? false : true;

      if (findItem) {
        findItem.valid = valid;
        return ([...prev].map(el => el.name == name ? findItem : el))
      }  
      else {
        return ([...prev, {name, valid}])
      }
    })
  }, [validMessage])


  const inpOps = {
    value: String(value),
    type: 'text',
    onAccept: (value) => {
      const numeric = Number(String(value).replace(/\s/g, '').replace(',', '.'));
      setter(numeric);
    },  
    unmask: true,
    ref,
    mask: Number,
    thousandsSeparator: " ",
    ...props
  }
 

  useEffect(() => {
    if (type != 'number') return;
    const validType = min && max ? 'minmax' : min && !max ? 'min' : !min && max ? 'max' : null;
    if (!validType) return;

    const messageObj = {
      min: `Значение должно быть больше ${min}`,
      max: `Значение должно быть не менее ${max}`,
      minmax: `Значение должно быть от ${min} до ${max}`
    }

    const funcObj = {
      min: () => Number(value) < min ? true : false,
      max: () => Number(value) > max ? true : false,
      minmax: () => Number(value) < min || Number(value) > max ? true : false,
    }

    if (funcObj[validType]()) setValidMessage(messageObj[validType]);
    else setValidMessage('');

  }, [value])


  return (<>
    <div className={cls.wrap}>
      {title && <p className={cls.title}>{title}</p>}
      <IMaskInput {...inpOps} className={cls.inp} />
      <p className={cls.valid} data-visible = {validMessage ? true : false}>{validMessage}</p>
    </div>
  </>);
}
