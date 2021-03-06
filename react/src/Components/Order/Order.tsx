import React, {useEffect, useState} from 'react';
import {compose} from "redux";
import {connect} from "react-redux";
import {Redirect} from "react-router-dom";
import style from './Order.module.css';
import {getOrder, getOrderDates, getTotalQuantity} from "../../Redux/selectors";
import {AppStateType} from "../../Redux/Store";
import OrderForm from "../../common/FormControls/OrderForm";
import {I_LanguageData, I_orderDates, I_orderFormData, I_orderItem} from "../../types/types";
import {fetchOrderInfo, submitOrder} from "../../Redux/actions";
import {OrderModal} from "../../common/PopupWrapper";
import {Button, Modal} from "antd";
import Preloader from "../../common/Preloader";

interface I_Props {
    languageData: I_LanguageData,
    totalQuantity: number
    submitOrder: (formData: I_orderFormData) => void
    fetchOrderInfo: () => void
    orderDisabled: I_orderDates[]
    order: Array<I_orderItem>
    submitting: 'pending' | 'stop' | 'success'
}

const Order = ({totalQuantity, submitOrder, fetchOrderInfo, orderDisabled, order, submitting, languageData}: I_Props) => {
    let [isPopUpOpen, setPopUpOpen] = useState(false);
    let [isSuccessOpen, setIsSuccessOpen] = useState(false);
    let [success, setSuccess] = useState(false);

    useEffect(() => { fetchOrderInfo() }, []);

    const onSubmit = (formData: I_orderFormData) => {
        if (+formData.payment === 2) {
            setPopUpOpen(true);
            submitOrder({...formData, comment: formData.comment ? formData.comment : ''});
        } else {
            setIsSuccessOpen(true);
            submitOrder({...formData, comment: formData.comment ? formData.comment : ''});
        }
    };

    useEffect(() => {
        if (submitting === 'stop') {
            setPopUpOpen(false)
        } else if (submitting === 'pending') {
            setPopUpOpen(true)
        } else {
            setPopUpOpen(true)
        }
    }, [submitting]);

    if (totalQuantity <= 0 || success) {
        return <Redirect to={`/catalog`}/>
    } else
        return (
            <div className={style.pageWrapper}>
                { isSuccessOpen && <OrderSuccess
                    text={languageData.order.front_text}
                    submitting={submitting}
                    handleOk={() => {setIsSuccessOpen(false); setSuccess(true)}}
                />}
                {/*{ isPopUpOpen && <OrderModal*/}
                {/*    text={languageData.order.front_text.filter(t => t.text_name === 'modal2')[0]}*/}
                {/*    title={"success"} order={order}*/}
                {/*    submitting={submitting}*/}
                {/*    handleCancel={() => {setPopUpOpen(!isPopUpOpen)}}*/}
                {/*/> }*/}
                <div className={style.title}>
                    <h3 onClick={() => {setPopUpOpen(!isPopUpOpen)}}>Подтвердить заказ</h3>
                    <hr />
                </div>
                <div className={style.container}>
                    <span className={style.titleLabel} onClick={() => {setIsSuccessOpen(!isSuccessOpen)}}>Поля отмеченные * обязательны для заполнения</span>
                    <OrderForm onSubmit={onSubmit} orderDisabled={orderDisabled}/>
                </div>
            </div>
        );
};

const mapStateToProps = (state: AppStateType) => {
    return {
        totalQuantity: getTotalQuantity(state),
        orderDisabled: getOrderDates(state),
        order: getOrder(state),
        submitting: state.reducer.submitting
    }
};

export default compose(
    connect(mapStateToProps, {submitOrder, fetchOrderInfo})
)(Order);

const OrderSuccess = ({handleOk, handleCancel, title, submitting, text}:any) => {

    return (
        <Modal
            visible={true}
            title={title}
            onOk={handleOk}
            onCancel={handleOk}
        >
            {submitting === 'pending' ? <Preloader/> :
                <div className="ant-modal-confirm-success" style={{display: "flex", flexDirection: "column", justifyContent: "center", textAlign: "center" }}>
                    <h1>{text && text[0].text ? text[0].text :"Спасибо за заказ."}</h1>
                    <span style={{marginBottom: '30px'}}>{text && text[1].text ? text[1].text : "В ближайшее время с вами свяжутся."}</span>
                    <div style={{maxWidth: '50%', margin: 'auto'}}>
                    <Button key="success" onClick={handleOk}>
                        Return To Menu
                    </Button>
                    </div>
                </div>
            }
        </Modal>
    )
};
