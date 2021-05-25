/* global kakao */

import React, { useEffect, useState, useRef } from "react";

export default function KakaoMap(props) {
  const { markerPositions, size } = props;
  const [kakaoMap, setKakaoMap] = useState(null);
  const [markers, setMarkers] = useState([]);

  const container = useRef();

  // 지도 그리기
  useEffect(() => {
    const script = document.createElement("script");
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.REACT_APP_JS_APPKEY}&autoload=false`;
    document.head.appendChild(script);

    script.onload = () => {
      kakao.maps.load(() => {
        const center = new kakao.maps.LatLng(
          37.50972119892644,
          127.01769634167654
        );
        const options = {
          center,
          level: 3,
        };
        const map = new kakao.maps.Map(container.current, options);
        //setMapCenter(center);
        setKakaoMap(map);
      });
    };
  }, [container]);

  // 지도 사이즈 조절
  useEffect(() => {
    if (kakaoMap === null) {
      return;
    }

    // save center position
    const center = kakaoMap.getCenter();

    // change viewport size
    const [width, height] = size;
    container.current.style.width = `${width}px`;
    container.current.style.height = `${height}px`;

    // relayout and...
    kakaoMap.relayout();
    // restore
    kakaoMap.setCenter(center);
  }, [kakaoMap, size]);

  // 마커 생성
  useEffect(() => {
    if (kakaoMap === null) {
      return;
    }

    const positions = markerPositions.map(
      (pos) => new kakao.maps.LatLng(...pos)
    );

    setMarkers((markers) => {
      // clear prev markers
      markers.forEach((marker) => marker.setMap(null));

      // assign new markers
      return positions.map(
        (position) =>
          new kakao.maps.Marker({
            map: kakaoMap,
            position: position,
            clickable: true,
          })
      );
    });

    if (positions.length > 0) {
      const bounds = positions.reduce(
        (bounds, latlng) => bounds.extend(latlng),
        new kakao.maps.LatLngBounds()
      );

      kakaoMap.setBounds(bounds);
    }
  }, [kakaoMap, markerPositions]);

  // 마커 인포 생성
  useEffect(() => {
    if (kakaoMap === null) {
      return;
    }

    const iwContent = '<div style="padding:5px;">Hello World!</div>';
    const iwRemoveable = true;

    const infowindow = new kakao.maps.InfoWindow({
      content: iwContent,
      removable: iwRemoveable,
    });

    markers.forEach((marker, idx) => {
      if (idx === 0) {
        kakao.maps.event.addListener(marker, "click", function () {
          infowindow.open(kakaoMap, marker);
        });
      }
    });
  }, [kakaoMap, markers]);

  // 우클릭 이벤트
  // useEffect(() => {
  //   if (kakaoMap === null) {
  //     return;
  //   }

  //   kakao.maps.event.addListener(kakaoMap, "rightclick", function (mouseEvent) {
  //     const latlng = mouseEvent.latLng;
  //     const position = new kakao.maps.LatLng(latlng["Ma"], latlng["La"]);
  //     new kakao.maps.Marker({
  //       map: kakaoMap,
  //       position: position,
  //     });
  //   });
  // }, [kakaoMap]);

  return <div id="container" ref={container} />;
}
