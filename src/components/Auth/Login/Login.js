import './Login.scss'
import { Button, Form, Input, message, notification } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

import { callLogin } from '../../../services/api';
import { doLoginAction, doLoginDataUser } from '../../../redux/account/accountSlice';
import { useDispatch } from 'react-redux';
const Login = () => {
  const dispatch = useDispatch()
  const [isSubmit, setIsSubmit] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();

//   const handleClickRegister = () => {
//       handleClose()
//       navigate('/register')
//   }
  const onFinish = async (values) => {
    const {Username, Password} = values;
    setIsSubmit(true);
    const res = await callLogin(Username, Password);
    setIsSubmit(false);
    if(res) {
      console.log("res", res);
      localStorage.setItem('access_token', res.data.access_token);
      localStorage.setItem('refresh_token', res.data.access_token);
      localStorage.setItem('user_id', res.data.UserID );
      document.cookie = `access_token_cookie=${res.data.access_token}; path=/`;

      
      dispatch(doLoginAction(JSON.parse(res.config.data)));
      console.log('tess',doLoginAction(JSON.parse(res.config.data)) );
      dispatch(doLoginDataUser(res.data));
      message.success('Đăng nhập tài khoản thành công!');
      navigate('/');
    }else{
      notification.error({
        message:'Có lỗi xáy ra',
        description:
          res.message && Array.isArray(res.message) ? res.message[0] :res.message[1],
        duration: 5
      })
    }
  }
  return (
   <>
      <div className="login">
        <Form
              form={form}
              name="basic"
              className="login-form"
              labelCol={{
                span: 8,
              }}
              wrapperCol={{
                span: 24,
              }}
              style={{
                maxWidth: 400,
                margin: '0 auto'
              }}
              initialValues={{
                remember: true,
              }}
              onFinish={onFinish}
              autoComplete="off"
            >
              
              <h2 style={{marginBottom:'10px'}}>Đăng nhập</h2>
  
              <Form.Item
                labelCol={{
                  span: 24,
                }}
   
                label="Username"
                name="Username"
                rules={[
                  {
                    required: true,
                    message: 'Please input your Username!',
                  },
                ]}
              >
                <Input style={{
                  height:'40px',
                  marginTop:'-6px'

                }} />
              </Form.Item>
  
              <Form.Item
                labelCol={{
                  span: 24,
                }}            
                label="Password"
                name="Password"
                rules={[
                  {
                    required: true,
                    message: 'Please input your password!',
                  },
                ]}
              >
                <Input.Password style={{
                  height:'40px',
                  marginTop:'-10px',
                }}/>
              </Form.Item>
  
              <Form.Item
                wrapperCol={{
                  span: 24,
                }}
                style={{
                    marginTop:'30px'
                }}
              >
                <Button style={{
                  height:'40px',
                  width:'120px',
                  
                }}  type="primary" htmlType="Đăng nhập" loading={isSubmit}>
                  Đăng nhập
                </Button >

                <Button style={{
                  height:'40px',
                  width:'120px',
                  marginLeft:'40px'
                }} htmlType="Đăng nhập" onClick={() => {
                  navigate("/forgotPassword")
                }}>
                  Quên mật khẩu
                </Button >
              </Form.Item>
              
            <p style={{textAlign: 'center'}}>Bạn chưa có tài khoản <a style={{marginLeft:'3px', textDecoration:'underline'}} onClick={()=>{navigate('/register')}}>Đăng ký</a></p>
            </Form>
        
    </div>

   </>
  )

    
};
export default Login;