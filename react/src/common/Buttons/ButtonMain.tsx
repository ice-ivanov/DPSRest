import React, {useEffect, useRef, useState} from 'react';
import classNames from "classnames/bind";
import style from "./Buttons.module.css";

interface IProps {
    type?: "button" | "submit" | "reset"
    disabled?: boolean
    onClickCallback?: () => void
    buttonText: string
}

const ButtonMain = ({
                        onClickCallback = () => {},
                        buttonText,
                        disabled,
                        type
                    }: IProps) => {
    let [addSucces, setAddSucces] = useState(false);
    let timer: any = useRef(); //now you can pass timer to another component

    let onButtonClick = () => {
        onClickCallback();
        setAddSucces(true);
        timer.current = window.setTimeout(() => {
            setAddSucces(false);
        }, 500)
    };

    useEffect(() => {
        return () => { // Return callback to run on unmount.
            window.clearTimeout(timer);
        };
    }, []);

    let cx = classNames.bind(style);
    let classNameForbtnAdd = cx(style.btnAdd, {
        success: addSucces
    });
    return (
        <button className={classNameForbtnAdd}
                disabled={addSucces || disabled}
                onClick={onButtonClick}
                type={type}
        >{buttonText}
        </button>
    )
};

export default ButtonMain;