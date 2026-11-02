import {useState, type InputHTMLAttributes} from 'react';
import {Eye, EyeOff} from 'lucide-react';

type PasswordInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>;

export function PasswordInput(props:PasswordInputProps) {
 const [visible,setVisible]=useState(false);
 return <span className="password-input">
  <input {...props} type={visible?'text':'password'}/>
  <button type="button" className="password-visibility" aria-label={visible?'Hide password':'Show password'} aria-pressed={visible} onClick={()=>setVisible(value=>!value)}>
   {visible?<EyeOff size={19}/>:<Eye size={19}/>}
  </button>
 </span>;
}
