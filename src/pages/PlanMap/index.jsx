import { Button, Table } from 'antd';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { FaMap } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { setMapData } from '../../redux/planMap/planMapSlice';

const columns = (handleMapClick) => [
    {
        title: 'Description',
        dataIndex: 'description',
        key: 'description',
    },
    {
        title: 'Action',
        key: 'action',
        render: (_, record) => (
            <Button type="primary" icon={<FaMap />} onClick={() => handleMapClick(record)}>
                See plan map
            </Button>
        ),
    },
];
const PlanMap = () => {
    const [data, setData] = useState([]);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const fetchData = async () => {
            const { data } = await axios.get('https://apilandinvest.gachmen.org/api/districts/get_by_name/');
            setData(data);
        };

        fetchData();
    }, []);

    const handleMapClick = (record) => {  
        const searchParams = new URLSearchParams(location.search);
        searchParams.set('quyhoach', record.id);
        navigate(`/?${searchParams.toString()}`);
    };

    return <Table dataSource={data} columns={columns(handleMapClick)} rowKey="id" />;
};

export default PlanMap;
