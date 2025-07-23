import React from "react";
import style from "../styles/button.module.css";

type ButtonProps = {
  btnText: string;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
};

const Button = ({
  btnText,
  type = "button",
  disabled = false,
}: ButtonProps) => {
  return (
    <button className={style.buttonMain} type={type} disabled={disabled}>
      {btnText}
    </button>
  );
};

export default Button;
