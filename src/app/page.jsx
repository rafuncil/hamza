'use client'
import React, { useEffect, useState } from 'react';
import Select from 'react-select';
import Input from '@/components/Input';
import { customSeletcStyles } from '@/scripts';

export default function Home() {

  // const selectOps = data.map(el => ({value: el.price, label: el.model + ` —  ${el.price.toLocaleString('ru-RU')}₽`}))
  const [selectedOption, setSelectedOption] = useState(null);

  const [price, setPrice] = useState(null);
  const [paymentType, setpaymentType] = useState("nal");
  const [productName, setProductName] = useState(null);
  const [payment, setPayment] = useState(null);
  const [time, setTime] = useState(6);
  const [showInfo, setShowInfo] = useState(false);
  const [options, setOptions] = useState([]);
  
  const [monthlyPrice, setMonthlyPrice] =useState('');
  const [totalPrice, setTotalPrice] =useState('');
  const [overPrice, setOverPrice] =useState('');

  const [valid, setValid] = useState([]);

  const manualOption = { label: 'Другой товар', value: null };

  const manualOptionGroup = {
    label: '—',
    options: [manualOption]
  };

  const fullOptions = [...options, manualOptionGroup];
  const firstPaymentRate = 0.25; // процент первоначального взноса


  useEffect(() => {
    fetch('https://raw.githubusercontent.com/rafuncil/cubecalc/main/public/data/products_full.json')
    .then(response => response.json())
    .then(data => setOptions(data))
    .catch(error => console.error('Error:', error));
  }, [])

  const sendReq = (e) => {
    e.preventDefault(); // чтобы страница не перзагружалась после каждого сабмита
   
    if (!price || !payment || !productName || !time || valid.find(el => el.valid == false )) 
      return alert('Все поля должны быть заполнены корректно');

    
    const message = `Ас саламу алайкум! Хочу оформить рассрочку:

      • Товар: ${productName}
      • Первый взнос: ${Number(payment).toLocaleString('ru-RU') + ' ₽'} 
      • Срок: ${time} мес.
      • Способ оплаты: ${paymentType == 'nal' ? "Наличный" : "Безналичный" }
      • Платёж в месяц: ${monthlyPrice} 
      • Общая стоимость: ${totalPrice}`;

    
    const link = document.createElement('a')

    link.href = `https://wa.me/79203100003?text=${encodeURIComponent(message)}`;
    link.target = '_blank';
    link.click()
    
  }
  
  const selectChange = (e) => {
    if (e.value === null) {
      setSelectedOption(manualOption);
      setProductName(manualOption.label);
      return;
    }

    setPrice(e.value);
    setPayment(e.value * firstPaymentRate)
    setProductName(e.label)
    setSelectedOption(e)
    setShowInfo(true); // показываем блок
  }

  const isOptionSelected = (option) => {
    return selectedOption ? selectedOption === option.label : false
  }

 
  useEffect(() => {
    if (
      price !== null && (
        !selectedOption ||
        (selectedOption.value !== null && Number(price) !== Number(selectedOption.value))
      )
    ) {
      setSelectedOption(manualOption);
      setProductName(manualOption.label);
      setShowInfo(true);
    }
    
    if (price) {
      const newMin = Math.round(price * firstPaymentRate / 1000) * 1000;
      const newMax = Math.ceil(price / 1000) * 1000;
  
      // если текущий payment не попадает в новый диапазон — пересчитай
      if (payment === null || payment < newMin || payment > newMax) {
        setPayment(newMin); // или можно: price * 0.3
      }
    }
  }, [price, options]);

  useEffect(() => {
    if (
      selectedOption?.value === null && // выбран "Другой товар"
      price !== null &&
      !payment // только если взнос ещё не заполнен
    ) {
      setPayment(Math.round(price * firstPaymentRate / 1000) * 1000); // округляем до 1000
    }
  }, [price, selectedOption, options, paymentType]);
    

  useEffect(() => {
    let paymentTypeRate = paymentType == "beznal" ? 1.09 : 1;
    let rate = Number(time) <= 6 ? 0.06 : 0.07;
    // let rate = 0.05;
    let credit = Number(price) - Number(payment); // сумма выдаваемая в кредит без наценки
    let overCredit = Math.round(credit * (1 + rate * Number(time))/ 100 * paymentTypeRate) * 100 ; // сумма выдаваемая в кредит с наценкой 
    let monthlyPayment = Math.round(overCredit / time / 10)*10;

   
    setMonthlyPrice((monthlyPayment).toLocaleString('ru-RU') + ' ₽'); // ежемесячный платеж
    setTotalPrice(Math.round(monthlyPayment * time + Number(payment)).toLocaleString('ru-RU') + ' ₽'); // общая стоимость
    setOverPrice(Math.round(monthlyPayment * time - credit).toLocaleString('ru-RU')  + ' ₽') // тороговая наценка

  }, [time, payment, price, options, paymentType])


  const handlePaymentType = (e) => {
    let _value = e.target.value
    setpaymentType (_value)
  }

  const rangePaymentOps = {
    step: 1000,
    name: 'downPayment',
    max: Math.ceil(price/1000)*1000,
    min: Math.round(price * firstPaymentRate /1000)*1000,
    value: payment || 0,
  
    onChange: (e) => {
      let step = 1000;
      let value = e.target.value;
      const maxVal = price;
      const minVal = price * firstPaymentRate

      
      if ((value - price < step) && (value - price > 0)) setPayment(maxVal)
        else if ((value - price * firstPaymentRate < step) && ((value - price * firstPaymentRate < 0) || (value - price * firstPaymentRate < step))) setPayment(minVal)
          else setPayment(value)

    }
      
  }

  const rangeMonthOps = {
    step: 1,
    name: 'monthCount',
    min: 2,
    max: 6,
    defaultValue: 2,
    value: typeof time !== 'undefined' ? time : '',
    onChange: e => setTime(e.target.value)
  }
  
  return (<>
    <div className='form-block'>
      <form className="form" onSubmit={sendReq}>
        <h1>Калькулятор рассрочки</h1>
        <Select 
          onChange={selectChange} 
          styles={customSeletcStyles}  
          options={fullOptions}
          value={selectedOption}
          isSearchable={false}
          isOptionSelected={isOptionSelected}
          placeholder="— Выберите —"
        />
        <Input name='price' onValid={setValid} title="Стоимость товара (₽)" value={typeof price === 'number' ? price : ''} type='number'  setter={setPrice}/>

        <Input name='payment' onValid={setValid} title="Первоначальный взнос (₽)" min={Number(price) * firstPaymentRate} max={Number(price)} 
          type='number' value={typeof payment !== 'undefined' ? payment : ''} setter={setPayment} 
        />
        <input type="range" {...rangePaymentOps} />

        <Input name='months' onValid={setValid} title="Срок рассрочки (мес.)" min={1} max={12}  placeholder= '' type='number' value={time} setter={setTime} />
        <input type="range"  {...rangeMonthOps} />

        <div className="payment-section">
          <div className="payment-label">Способ оплаты</div>
          <div className='paymentType'>
          
           <input 
            name="paymentType" 
            type="radio" 
            id="nal" 
            onChange={handlePaymentType} 
            value={"nal"} 
              defaultChecked={paymentType == "nal"}
            />
            <input 
            name="paymentType" 
            type="radio" 
            id="beznal" 
            onChange={handlePaymentType} 
            value={"beznal"} 
              defaultChecked={paymentType == "beznal"}
            />
  
            <label htmlFor="nal">
            <span>Наличный</span>
            </label>
            <label htmlFor="beznal">
            <span>Безналичный</span>
            </label>
  
            <div className="slider-track"></div>
          </div>
        </div>
          

        <div className={`final-info ${showInfo ? 'visible' : 'hidden'}`}> 
          <p>Ежемесячный платеж: <span>{monthlyPrice}</span></p>
          <p>Общая стоимость: <span>{totalPrice}</span></p>
          <p>Торговая наценка: <span>{overPrice}</span></p>
        </div>
      
        <button type='submit' className='btn'>Оставить заявку
        <img src="images/WhatsApp.svg" />
        </button>
                
      </form>
    </div>
  </>
  );

}
