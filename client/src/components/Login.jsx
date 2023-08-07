import { useRef, useState, useEffect} from "react"
import axios from "../api/axios";
import useAuth from "../hooks/useAuth"
import { Link, useNavigate, useLocation } from 'react-router-dom'

const LOGIN_URL = '/auth/login'

const Login = () => {
    const { auth, setAuth } = useAuth();

    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || "/";

    const userRef = useRef();
    const errRef = useRef();

    const [user, setUser] = useState('')
    const [pwd, setPwd] = useState('');
    const [errMsg, setErrMsg] = useState('');

    useEffect(() => {
        userRef.current.focus();
    }, [])

    useEffect(() => {
        setErrMsg('');
    }, [user, pwd])

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {

            const response = await axios.post(LOGIN_URL, 
                JSON.stringify({ username: user, password: pwd }),
                {
                    headers: { 'Content-Type': 'application/json' },
                    withCredentials: true
                }
            );

            console.log(JSON.stringify(response?.data));
            //console.log(JSON.stringify(response));
            const accessToken = response?.data?.accessToken;
            const roles = response?.data?.roles;
            setAuth({ user, pwd, roles, accessToken });
            setUser('')
            setPwd('');
                
            navigate(from, { replace: true });
            
        } catch (error) {
            if (!error?.response) {
                setErrMsg('No server response')
            } else if (error.response?.status === 400) {
                setErrMsg('Missing Username or Password');
            } else if (error.response?.status === 401) {
                setErrMsg('Unauthorized')
            } else {
                setErrMsg('Login Failed');
            }
            errRef.current.focus();
        }

    }

  return (
    
        <section>
            <p ref={errRef} className={errMsg ? "errmsg" : "offscreen"} aria-live="asserive">
                {errMsg}
            </p>
            <h1>Sign In</h1>
            <form onSubmit={handleSubmit}>
                <label htmlFor="username">
                    Username: 
                </label>
                <input 
                    type='text'
                    id="username"
                    ref={userRef}
                    autoComplete="off"
                    onChange={(e) => setUser(e.target.value)}
                    value={user}
                    required
                />
                <label htmlFor="password">
                    Password:
                </label>
                <input 
                    type='password'
                    id="password"
                    onChange={(e) => setPwd(e.target.value)}
                    value={pwd}
                    required
                />
                <button>
                    Sign In
                </button>
            </form>
            <p>
                Need an account?<br />
                <span className="line">
                    <a href="#">Register</a>
                </span>
            </p>
        </section>
    
  )
}

export default Login