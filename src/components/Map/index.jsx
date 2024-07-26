import React, { memo, useEffect, useState } from 'react';
import {
    MapContainer,
    TileLayer,
    ImageOverlay,
    Marker,
    Popup,
    useMapEvents,
    Polygon,
    LayersControl,
    Pane,
} from 'react-leaflet';
import L from 'leaflet';
import DrawerView from '../Home/DrawerView';
import fetchProvinceName, { getProvince } from '../../function/findProvince';
import { findClosestDistrict } from '../../function/findClosestDistrict';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import ResetCenterView from '../../function/resetCenterView';
import { selectFilteredMarkers } from '../../redux/filter/filterSelector';
import { formatToVND } from '../../function/formatToVND';
import { setListMarker } from '../../redux/listMarker/listMarkerSllice';
const center = [21.136663, 105.7473446];

const customIcon = new L.Icon({
    iconUrl: require('../../assets/marker.png'),
    iconSize: [38, 38], // size of the icon
    iconAnchor: [22, 38], // point of the icon which will correspond to marker's location
    popupAnchor: [-3, -38], // point from which the popup should open relative to the iconAnchor
});

const Map = ({opacity, handleSetProvinceName, setSelectedPosition, selectedPosition}) => {
    const [idProvince, setIdProvince] = useState();
    const [imageUrl, setImageUrl] = useState();
    const [location, setLocation] = useState([]);
    const [coodination, setCoodination] = useState([]);
    const [selectedMarker, setSelectedMarker] = useState(null);
    const locationLink = useLocation();
    const dispatch = useDispatch();

    const listMarker = useSelector(selectFilteredMarkers);
    const [isDrawerVisible, setIsDrawerVisible] = useState(false);

    const { lat, lon, coordinates } = useSelector((state) => state.searchQuery.searchResult);
    const [polygon, setPolygon] = useState(null);

    const tileLayers = [
        // "https://qhkhsddhanoi.govone.vn/DRSCache/hanoistnmt/HN-DongAnh-KH2022/HN-DongAnh-KH2022_Clip.tif/{z}/{x}/{y}.png",
        // "https://qhkhsddhanoi.govone.vn/DRSCache/hanoistnmt/HN-BaVi-KH2022/HN-BaVi-KH2022_Clip.tif/{z}/{x}/{y}.png",
        // "https://qhkhsddhanoi.govone.vn/DRSCache/hanoistnmt/HN-GiaLam-KH2022/HN-GiaLam-KH2022_Clip.tif/{z}/{x}/{y}.png",
        // "https://qhkhsddhanoi.govone.vn/DRSCache/hanoistnmt/HN-MeLinh-KH2022/HN-MeLinh-KH2022_Clip.tif/{z}/{x}/{y}.png",
        'https://han01.vstorage.vngcloud.vn/v1/AUTH_1dbb06310d21466fa9693a9d20fc3965/guland/hoa-binh-2030/{z}/{x}/{y}.png',

        // Thêm các URL của các huyện khác ở đây
    ];

    const { BaseLayer } = LayersControl;

    const closeDrawer = () => {
        setIsDrawerVisible(false);
    };
    const MapEvents = () => {
        const mapInstance = useMapEvents({
            click: async (e) => {
                const { lat, lng } = e.latlng;
                setSelectedPosition({ lat, lng });
                const locationInfo = await fetchProvinceName(lat, lng);
                console.log(locationInfo);
                handleSetProvinceName(locationInfo);
            },
            zoom: () => {
                if (mapInstance.getZoom() >= 8) {
                    const center = mapInstance.getCenter();
                    handleZoomEnd(center.lat, center.lng);
                }
            },
        });

        return null;
    };

    const handleZoomEnd = async (lat, lng) => {
        try {
            const locationInfo = await fetchProvinceName(lat, lng);
            console.log('Zoom end location info:', locationInfo);
            const res = await getProvince(locationInfo.provinceName);
            console.log(res);
            const data = await findClosestDistrict(res.TinhThanhPhoID, locationInfo.districtName);

            data.found ? setIdProvince(data.districtId) : console.log(data.message);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        setCoodination(coordinates);
    }, [coordinates]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const searchParams = new URLSearchParams(locationLink.search);
                const quyhoach = searchParams.get('quyhoach');
                console.log(quyhoach);
                if (quyhoach) {
                    const { data } = await axios.get(
                        `https://apilandinvest.gachmen.org/api/districts/detail/${quyhoach}`,
                    );
                    setImageUrl(data[0].imageHttp);
                    setLocation(JSON.parse(data[0].location));
                    setCoodination(JSON.parse(data[0].coordation));
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, [locationLink.search]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const { data } = await axios.get(
                    `https://apilandinvest.gachmen.org/api/location/list_info_by_district/${idProvince}`,
                );
                // setListMarker(data.data);
                data.data ? dispatch(setListMarker(data.data)) : dispatch(setListMarker([]));
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, [dispatch, idProvince]);

    useEffect(() => {
        if (coodination && coodination.length > 0 && Array.isArray(coodination[0])) {
            const leafletcoodination = coodination[0].map((coord) => [coord[1], coord[0]]);
            setPolygon(leafletcoodination);
        } else {
            setPolygon(null);
        }
    }, [coodination]);

    return (
        <MapContainer
            style={{ width: '100%', height: 'calc(100vh - 56px)' }}
            center={center}
            zoom={13}
            maxZoom={30}
            // whenReady={(map) => {
            //     mapRef.current = map.target;
            // }}
        >
            <MapEvents />
            <LayersControl>
                <BaseLayer checked name="Map vệ tinh">
                    <TileLayer
                        url="http://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}"
                        subdomains={['mt0', 'mt1', 'mt2', 'mt3']}
                        maxZoom={30}
                        attribution="&copy; <a href='https://www.google.com/maps'>Google Maps</a> contributors"
                    />
                </BaseLayer>
                <BaseLayer name="Map mặc định">
                    <TileLayer
                        maxZoom={22}
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                </BaseLayer>
            </LayersControl>
            <Pane name="PaneThai" style={{ zIndex: 650 }}>
                    <TileLayer url={"https://qhkhsddhanoi.govone.vn/DRSCache/hanoistnmt/HN-DongAnh-KH2022/HN-DongAnh-KH2022_Clip.tif/{z}/{x}/{y}.png"} pane="overlayPane" minZoom={10} maxZoom={22} maxNativeZoom={18} opacity={opacity} />
            </Pane>
         
            {/* {imageUrl && location && (
                <>
                    <ImageOverlay url={imageUrl} bounds={location} opacity={opacity} />
                </>
            )} */}

            {selectedPosition && (
                <Marker position={selectedPosition}>
                    <Popup>Vị trí đã chọn</Popup>
                </Marker>
            )}
            {lat && lon && (
                <>
                    <Marker position={[lat, lon]}>
                        <Popup>Vị trí trung tâm</Popup>
                    </Marker>
                    <ResetCenterView lat={lat} lon={lon} />
                </>
            )}

            {listMarker.length > 0 &&
                listMarker.map((marker) => (
                    <Marker key={marker.id} position={[marker.latitude, marker.longitude]} icon={customIcon}>
                        <Popup>
                            <div>
                                <h3 style={{ fontWeight: 600 }}>{marker.description}</h3>
                                <p style={{ fontSize: 20, fontWeight: 400, margin: '12px 0' }}>
                                    Giá/m²: {formatToVND(marker.priceOnM2)}
                                </p>
                                <button
                                    className="button--detail"
                                    onClick={() => {
                                        setIsDrawerVisible(true);
                                        setSelectedMarker(marker);
                                    }}
                                >
                                    Xem chi tiết
                                </button>
                            </div>
                        </Popup>
                    </Marker>
                ))}

            {polygon && <Polygon pathOptions={{ fillColor: 'transparent' }} positions={polygon} />}
            {selectedMarker && (
                <DrawerView
                    isDrawerVisible={isDrawerVisible}
                    closeDrawer={closeDrawer}
                    addAt={selectedMarker.addAt}
                    images={selectedMarker.imageLink}
                    description={selectedMarker.description}
                    priceOnM2={selectedMarker.priceOnM2}
                    typeArea={selectedMarker.typeArea}
                    area={selectedMarker.area}
                />
            )}
        </MapContainer>
    );
};

export default memo(Map);
