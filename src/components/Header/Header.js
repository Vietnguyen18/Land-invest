import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import logo from '../../assets/channels4_profile.jpg';

import { IoIosNotifications } from 'react-icons/io';
import './Header.scss';
import { Dropdown, Space, Avatar, List } from 'antd';
import { memo, useEffect, useState } from 'react';
import ModalNotification from '../Auth/ModalNotification';
import { useDispatch, useSelector } from 'react-redux';
import { doLogoutAction } from '../../redux/account/accountSlice';
import { callLogout, fetchAccount } from '../../services/api';
import { message, notification } from 'antd';
import axios from 'axios';
import { useDebounce } from 'use-debounce';
import { doSearch } from '../../redux/search/searchSlice';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { ActionIcon, HomeIcon, NewsIcon, SearchIcon, SearchNavbarIcon, NotificationIcon } from '../Icons';
import { FaMap } from 'react-icons/fa';
import { handleRefreshToken } from '../../utils/axios-customize';

const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org/search?';
const params = {
    format: 'json',
    addressdetails: 1,
    polygon_geojson: 1,
};

const iconAvatar = 'https://png.pngtree.com/png-clipart/20210608/ourlarge/pngtree-dark-gray-simple-avatar-png-image_3418404.jpg'


const Header = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const isAuthenticated = useSelector((state) => state.account.isAuthenticated);
    const datauser = useSelector((state) => state.account.dataUser);
    const user = useSelector((state) => state.account.Users);
    const [isShowModalLogin, setIsShowModalLogin] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResult, setSearchResult] = useState([]);
    const [debouncedInputSearch] = useDebounce(searchQuery, 300);
    const [isLoading, setIsLoading] = useState(false);
    const [apiUser, setApiUser] = useState([]);

    //User
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                if (datauser?.UserID) {
                    const response = await fetchAccount();
                    const fetchedUser = response.find((user) => user?.userid === datauser?.UserID);
                    fetchedUser && setApiUser(fetchedUser);
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
                notification.error({
                    message: 'Error',
                    description: 'Failed to fetch user data',
                });
            }
        };
        fetchUserData();
    }, [datauser?.UserID]);

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

    const handleLogOut = async () => {
        const { Username, Password } = user;
        console.log('user', Username, Password);
        const res = await callLogout(Username, Password);
        console.log('res', res);
        if (res) {
            dispatch(doLogoutAction());
            navigate('/');
            message.success('Đăng xuất thành công!');
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
                    console.log('test', filteredData);

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
        item &&
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
        // navigate(`/${item.name}`);
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
                    {/* <Navbar.Toggle aria-controls="basic-navbar-nav" /> */}
                    <Navbar.Collapse id="basic-navbar-nav list-item">
                        <Nav className="list-item-icon">
                            <NavLink to="/" className="nav-link">
                                <HomeIcon />
                            </NavLink>
                            <NavLink to="/planMap" className="nav-link">
                                <FaMap />
                            </NavLink>
                            <NavLink to="/notifications" className="nav-link">
                                <NotificationIcon />
                            </NavLink>
                            <NavLink to="/news" className="nav-link">
                                <NewsIcon />
                            </NavLink>
                            <NavLink to="/search" className="nav-link">
                                <SearchNavbarIcon />
                            </NavLink>
                            <NavLink to="/auctions" className="nav-link">
                                <ActionIcon />
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
                            <button  type="submit">
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
                                {!isAuthenticated ? (
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
                                                <Avatar src={apiUser?.avatarLink || iconAvatar} />
                                                {apiUser?.FullName}
                                            </Space>
                                        </a>
                                    </Dropdown>
                                )}
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
