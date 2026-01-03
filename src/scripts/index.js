
export const customSeletcStyles = {
  control: (provided, state) => ({
    ...provided,
    minHeight: '40px',
    border: '2px solid #e2e8f0',
    borderRadius: '30px',
    boxShadow: 'none',
    borderColor: '#e2e8f0',
    backgroundColor: '#222',
    fontSize: '16px'
  }),
  input: (provided) => ({
    ...provided,
    color: 'white', // ⬅️ вот тут меняешь цвет текста ввода
    fontSize: '16px', // можно и размер сразу
  }),
  option: (provided, state) => ({
    ...provided,
    padding: '12px 16px',
    backgroundColor: state.isSelected 
      ?'#666'
      : state.isFocused 
        ? '#444' 
        : '#222',
    color: 'white',
    '&:active': {
      backgroundColor: '#777',
    },
    fontSize: '14px'
  }),
  menu: (provided) => ({
    ...provided,
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    fontSize: '16px',
    backgroundColor: '#222'
  }),
  groupHeading: (provided) => ({
    ...provided,
    padding: '8px 16px',
    fontSize: '12px',
    color: '#cbd5e0', // светло-серый текст
    backgroundColor: '#1a1a1a', // чуть темнее фон, чем у option
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '4px',
  }),
  dropdownIndicator: (provided) => ({
    ...provided,
    color: '#718096',
  }),
 
  placeholder: (provided) => ({
    ...provided,
    color: '#a0aec0',
  }),
  singleValue: (provided) => ({
    ...provided,
    color: '#white',
  }),
  
};
