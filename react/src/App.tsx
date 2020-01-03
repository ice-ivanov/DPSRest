import React from 'react';
import Main from "./Components/Main";
import store from "./Redux/Store";
import {Provider} from "react-redux";
import {HashRouter} from "react-router-dom";
import './App.css';

const App: React.FC = () => {
    return (
        <div className="App">
            <HashRouter basename={process.env.PUBLIC_URL}>
                <Provider store={store}>
                    {/*
                    // @ts-ignore*/}
                    <Main key={"MAIN"}/>
                </Provider>
            </HashRouter>
        </div>
    );
};

export default App;