import styles from "../styles/input.module.css";

type InputProps = {
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  id?: string;
};

const Input = ({
  placeholder,
  value,
  onChange,
  type = "text",
  id,
}: InputProps) => {
  return (
    <input
      type={type}
      className={styles.inputMain}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      id={id}
    />
  );
};

export default Input;
