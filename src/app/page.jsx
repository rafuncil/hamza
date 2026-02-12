'use client'
import React, { useEffect, useState } from 'react';
import Select from 'react-select';
import Input from '@/components/Input';
import { customSeletcStyles } from '@/scripts';

export default function Home() {

  const [selectedOption, setSelectedOption] = useState(null);

  const [price, setPrice] = useState(null);
  const [paymentType, setpaymentType] = useState("month");
  const [productName, setProductName] = useState(null);
  const [payment, setPayment] = useState(null);
  const [time, setTime] = useState(4);
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
  const firstPaymentRate = 0.20; // процент первоначального взноса
  const rate = 0.10;


  useEffect(() => {
    fetch('https://raw.githubusercontent.com/rafuncil/hamza/main/public/products_full.json')
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
      • Способ оплаты: ${paymentType == 'week' ? "Еженедельно" : "Ежемесячно" }
      • Платёж в ${paymentType == 'week' ? "неделю" : "месяц"}: ${monthlyPrice} 
      • Общая стоимость: ${totalPrice}`;

    
    const link = document.createElement('a')

    link.href = `https://wa.me/79057400007?text=${encodeURIComponent(message)}`;
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
    setPayment((e.value + e.value * Number(time) * 0.1) * firstPaymentRate)
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
      const newMin = Math.round((price + price * Number(time) * 0.1) * firstPaymentRate / 1000) * 1000;
      const newMax = Math.ceil(price / 1000) * 1000;
  
      // если текущий payment не попадает в новый диапазон — пересчитай
      if (payment === null || payment < newMin || payment > newMax) {
        setPayment(newMin); 
      }
    }
  }, [price, options]);

  useEffect(() => {
    if (
      selectedOption?.value === null && // выбран "Другой товар"
      price !== null &&
      !payment // только если взнос ещё не заполнен
    ) {
      setPayment(Math.round(price * (1 + Number(time) * rate) * firstPaymentRate / 1000) * 1000); // округляем до 1000
    }
  }, [price, selectedOption, options, paymentType]);
    

  useEffect(() => {
    //let paymentTypeRate = paymentType == "week" ? 4 : 1; 
    // let paymentTypeRate = 1;
    let totalCredit = Math.round((price * (1 + rate * Number(time))) / 100) * 100 ; // общая стоимость
    let monthlyPayment = paymentType == "week" ? (Math.round((totalCredit - Number(payment))/ time / 10) * 10)/ 4 : (Math.round((totalCredit - Number(payment))/ time / 10) * 10); 


   
    setMonthlyPrice((monthlyPayment).toLocaleString('ru-RU') + ' ₽'); // ежемесячный платеж
    setTotalPrice((totalCredit).toLocaleString('ru-RU') + ' ₽'); // общая стоимость
    setOverPrice(Math.round(totalCredit - price).toLocaleString('ru-RU')  + ' ₽') // тороговая наценка

  }, [time, payment, price, options, paymentType])


  const handlePaymentType = (e) => {
    let _value = e.target.value
    setpaymentType (_value)
  }

  const rangePaymentOps = {
    step: 1000,
    name: 'downPayment',
    max: Math.ceil(price/1000)*1000,
    min: Math.round(price * (1 + time * rate) * firstPaymentRate /1000)*1000,
    value: payment || 0,
  
    onChange: (e) => {
      let step = 1000;
      let value = e.target.value;
      let minPayment = price * (1 + time * rate) * firstPaymentRate;
      const maxVal = price;
      const minVal = price * (1 + time * rate) * firstPaymentRate;

      
      if ((value - price < step) && (value - price > 0)) setPayment(maxVal)
        else if ((value - minPayment < step) && ((value - minPayment < 0) || (value - minPayment < step))) setPayment(minVal)
          else setPayment(value)

    }
      
  }

  const rangeMonthOps = {
    step: 1,
    name: 'monthCount',
    min: 2,
    max: 6,
    defaultValue: 4,
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
        {/* <Input name='price' onValid={setValid} title="Стоимость товара (₽)" value={typeof price === 'number' ? price : ''} type='number'  setter={setPrice}/> */}

        <Input name='months' onValid={setValid} title="Срок рассрочки (мес.)" min={2} max={6}  placeholder= '' type='number' value={time} setter={setTime} />
        <input type="range"  {...rangeMonthOps} />
        
        <Input name='payment' onValid={setValid} title="Первоначальный взнос (₽)" min={Number(price) * (1 + Number(time) * rate) * firstPaymentRate} max={Number(price)} 
          type='number' value={typeof payment !== 'undefined' ? payment : ''} setter={setPayment} 
        />

        <input type="range" {...rangePaymentOps} />

    
        <div className="payment-section">
          <div className="payment-label">Способ оплаты</div>
          <div className='paymentType'>
          
           <input 
            name="paymentType" 
            type="radio" 
            id="week" 
            onChange={handlePaymentType} 
            value={"week"} 
              defaultChecked={paymentType == "week"}
            />
            <input 
            name="paymentType" 
            type="radio" 
            id="month" 
            onChange={handlePaymentType} 
            value={"month"} 
              defaultChecked={paymentType == "month"}
            />
  
            <label htmlFor="week">
            <span>Еженедельно</span>
            </label>
            <label htmlFor="month">
            <span>Ежемесячно</span>
            </label>
  
            <div className="slider-track"></div>
          </div>
        </div>
          

        <div className={`final-info ${showInfo ? 'visible' : 'hidden'}`}> 
          <p>{paymentType == 'week' ? "Еженедельный" : "Ежемесячный"} платеж: <span>{monthlyPrice}</span></p>
          <p>Общая стоимость: <span>{totalPrice}</span></p>
          {/* <p>Торговая наценка: <span>{overPrice}</span></p> */}
        </div>
      
        <button type='submit' className='btn'>Оставить заявку
        <img src="images/WhatsApp.svg" />
        </button>
                
      </form>
    </div>
  </>
  );

}
