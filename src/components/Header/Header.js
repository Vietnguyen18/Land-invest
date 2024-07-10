import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import { Link, NavLink, useNavigate, useSearchParams } from 'react-router-dom';
import logo from '../../assets/channels4_profile.jpg';

import { IoIosNotifications } from 'react-icons/io';
import './Header.scss';
import { Dropdown, Space, Avatar, List } from 'antd';
import { memo, useEffect, useState } from 'react';
import ModalNotification from '../Auth/ModalNotification';
import { useDispatch, useSelector } from 'react-redux';
import { doLogoutAction } from '../../redux/account/accountSlice';
import { callLogout, logoutUser, searchQueryAPI } from '../../services/api';
import { message, notification } from 'antd';
import axios from 'axios';
import { useDebounce } from 'use-debounce';
import  { doSearch } from '../../redux/search/searchSlice';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { ActionIcon, HomeIcon, NewsIcon, SearchIcon, SearchNavbarIcon } from '../Icons';

const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org/search?';
const params = {
    format: 'json',
    addressdetails: 1,
    polygon_geojson: 1,
};

const Header = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const isAuthenticated = useSelector((state) => state.account.isAuthenticated);
    const user = useSelector((state) => state.account.Users);
    const datauser = useSelector((state) => state.account.dataUser);

    const [isShowModalLogin, setIsShowModalLogin] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResult, setSearchResult] = useState([]);
    const [debouncedInputSearch] = useDebounce(searchQuery, 300);
    const [isLoading, setIsLoading] = useState(false);
  

    let items = [
        {
            label: <Link to="/userprofile">Trang profile</Link>,
            key: 'userprofile',
        },

        {
            label: (
                <label style={{ cursor: 'pointer' }} onClick={() => handleLogOut()}>
                    Đăng xuất
                </label>
            ),
            key: 'logout',
        },
    ];
    if (datauser?.role === true) {
        items.unshift({
            label: <Link to="/admin">Trang quản trị</Link>,
            key: 'admin',
        });
    }

    const handleClose = () => {
        setIsShowModalLogin(false);
    };

    function getCookie(cookieName) {
        const cookies = document.cookie.split('; ');
        for (const cookie of cookies) {
            const [name, value] = cookie.split('=');
            if (name === cookieName) {
                return value;
            }
        }
        return null;
    }

    const handleLogOut = async () => {
        // const token = localStorage.getItem('access_token');
        // if (!token) {
        //     notification.error({
        //         message: 'Lỗi xác thực',
        //         description: 'Không tìm thấy token. Vui lòng đăng nhập lại.'
        //     });
        //     return;
        // }
        const res = await callLogout();
        res.headers = {
            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        };
        if (res) {
            // res.headers= {
            //     'Authorization': `Bearer ${token}`
            // }
            // console.log("refresh_token logout",localStorage.getItem('refresh_token'))
            // console.log("access_token logout",localStorage.getItem('access_token'))
            console.log('res.headers', res.headers);
            dispatch(doLogoutAction());
            navigate('/');
            message.success('Đăng xuất thành công!');
            // localStorage.removeItem('access_token');
            // localStorage.removeItem('refresh_token');
        } else {
            notification.error({
                message: 'Có lỗi xáy ra',
                description: res.message && Array.isArray(res.message) ? res.message[0] : res.message[1],
                duration: 5,
            });
        }
    };

    useEffect(() => {
        const handleGetData = async () => {
            if (debouncedInputSearch) {
                try {
                    setIsLoading(true);
                    const { data } = await axios.get(
                        `${NOMINATIM_BASE_URL}${new URLSearchParams({
                            ...params,
                            q: debouncedInputSearch,
                        }).toString()}`,
                    );

                    const filteredData = data.filter((item) => item.geojson?.type === 'Polygon');

                    setSearchResult(filteredData);

                    setIsLoading(false);
                } catch (error) {
                    console.error('Error fetching data:', error);
                    setIsLoading(false);
                } finally {
                    setIsLoading(false);
                }
            } else {
                setSearchResult([]);
            }
        };

        handleGetData();
    }, [debouncedInputSearch]);

    const handleItemClick = (item) => {
        dispatch(
            doSearch({
                displayName: item.display_name,
                lat: item.lat,
                lon: item.lon,
                coordinates: item.geojson.coordinates,
                boundingbox: item.boundingbox,
            }),
        );
        setSearchQuery('');
        // window.history.pushState({}, '', `/${item.name}`);
        navigate(`/${item.name}`)
    };

    return (
        <>
            <Navbar bg="#262D34" className="header-container" expand="lg">
                <Container>
                    <Navbar.Brand href="/">
                        <div className="header-logo">
                            <img
                                src={logo}
                                width="30"
                                height="30"
                                className="d-inline-block align-top header-logo-img"
                                alt="React Bootstrap logo"
                            />
                            <span className="header-logo-content ml-2">LAND INVEST</span>
                        </div>
                    </Navbar.Brand>
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav list-item">
                        <Nav className="list-item-icon">
                            <NavLink to="/" className="nav-link">
                                <HomeIcon />
                            </NavLink>
                            <NavLink to="/auction" className="nav-link">
                                <ActionIcon />
                            </NavLink>
                            <NavLink to="/news" className="nav-link">
                               <NewsIcon />
                            </NavLink>
                            <NavLink to="/search" className="nav-link">
                               <SearchNavbarIcon />
                            </NavLink>
                        </Nav>
                        <form className="header-search">
                            <input
                                type="text"
                                placeholder="Type here to search..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                autoFocus
                            />
                            {isLoading && <AiOutlineLoading3Quarters className="loading" />}
                            <button type="submit">
                                <SearchIcon />
                            </button>
                            {searchResult.length > 0 && (
                                <List
                                    bordered
                                    className="list--search"
                                    dataSource={searchResult}
                                    renderItem={(item) => (
                                        <List.Item className="list--item" onClick={() => handleItemClick(item)}>
                                            {item.display_name}
                                        </List.Item>
                                    )}
                                />
                            )}
                        </form>

                        <div id="basic-navbar-nav">
                            <div className="header-right">
                                <div className="header-notification">
                                    <IoIosNotifications size={24} />
                                </div>
                                {
                                    !isAuthenticated ? (
                                        <button className="btn" onClick={() => setIsShowModalLogin(true)}>
                                            Đăng nhập
                                        </button>
                                    ) : (
                                        <Dropdown menu={{ items }} trigger={['click']}>
                                            <a
                                                style={{ color: '#fff', cursor: 'pointer' }}
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                }}
                                            >
                                                <Space>
                                                    <Avatar src={logo} />
                                                    {user?.Username}
                                                </Space>
                                            </a>
                                        </Dropdown>
                                    )
                                    // <>
                                    // <span style={{color:"#fff"}}><span style={{marginLeft:"2px"}}>{user.Username}</span></span>
                                    // <button className='btn' onClick={()=>handleLogOut()}>Đăng xuất</button>
                                    // </>
                                }
                            </div>
                        </div>
                    </Navbar.Collapse>
                </Container>
            </Navbar>
            <ModalNotification show={isShowModalLogin} handleClose={handleClose} />
        </>
    );
};

export default memo(Header);
