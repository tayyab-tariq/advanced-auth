import { useState, useEffect } from "react";
import PropTypes from 'prop-types';
import { Provider } from "react-redux";
import { useLocation } from "react-router-dom";
import { Helmet } from "react-helmet";
import App from "./App";
import axios from "axios";
import CommonLoading from "./components/CommonLoading";

const ErrorComponent = ({errorMessage} : {errorMessage: string}) => (
    <div className="text-red-500 font-bold text-center">{errorMessage}</div>
);

ErrorComponent.propTypes = {
    errorMessage: PropTypes.string.isRequired,
}


function AppContainer() {
    const location = useLocation();
    const store = null;
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const checkServerStatus = async () => {
          try {
            await axios.get("/api/server-status");
          } catch (error) {
            console.error("Server status check failed:", error);
            setError("Server is down. Please try again later.");
          } finally {
            setLoading(false);
          }
        };
    
        checkServerStatus();
    }, []);

    if (loading || error) {
        return (
          <div className="flex items-center justify-center h-screen">
            {loading ? <CommonLoading /> : <ErrorComponent errorMessage={error} />}
          </div>
        );
    }

    return (
        <Provider store={store}>
            <Helmet>
                <title>{getTitleFromRoute(location.pathname)}</title>
            </Helmet>
            <App />
        </Provider>
    )
}

export default AppContainer
