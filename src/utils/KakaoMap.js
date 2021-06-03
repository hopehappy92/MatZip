/* global kakao */

import React, { useEffect, useState, useRef, useCallback } from "react";

export default function KakaoMap(props) {
  const { documents, size } = props;
  const [kakaoMap, setKakaoMap] = useState(null);
  const [_, setMarkersAndOverlays] = useState([]);

  const container = useRef();

  const makeOverListener = useCallback((map, marker, infoWindow) => {
    return function () {
      infoWindow.open(map, marker);
    };
  }, []);

  const makeOutListener = useCallback((infoWindow) => {
    return function () {
      infoWindow.close();
    };
  }, []);

  const makeClickListener = useCallback((map, overlay) => {
    return function () {
      overlay.setMap(map);
    };
  }, []);

  // draw map
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

  // map resize
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

  // make marker
  useEffect(() => {
    if (kakaoMap === null) {
      return;
    }

    const positions = documents.map(
      (document) => new kakao.maps.LatLng(...[+document.y, +document.x])
    );

    setMarkersAndOverlays((markersAndOverlays) => {
      // clear prev markers and overlays
      markersAndOverlays.forEach((markerAndOverlay) =>
        markerAndOverlay.marker.setMap(null)
      );
      markersAndOverlays.forEach((markerAndOverlay) =>
        markerAndOverlay.overlay.setMap(null)
      );

      // assign new markers and overlays
      return positions.map((position, idx) => {
        // make marker
        const makeMarker = new kakao.maps.Marker({
          map: kakaoMap,
          position: position,
          // clickable: true,
        });

        // make marker info
        const infoWindow = new kakao.maps.InfoWindow({
          content: documents[idx].place_name,
        });

        // make custom overlay
        const makeOverlay = new kakao.maps.CustomOverlay({
          content: `
          <div>
            <b>
              ${documents[idx].address_name}
            </b>
          </div>
          `,
          map: kakaoMap,
          position: position,
        });

        // add event
        kakao.maps.event.addListener(
          makeMarker,
          "mouseover",
          makeOverListener(kakaoMap, makeMarker, infoWindow)
        );
        kakao.maps.event.addListener(
          makeMarker,
          "mouseout",
          makeOutListener(infoWindow)
        );

        kakao.maps.event.addListener(
          makeMarker,
          "click",
          makeClickListener(kakaoMap, makeOverlay)
        );

        makeOverlay.setMap(null);

        return { marker: makeMarker, overlay: makeOverlay };
      });
    });

    // reset map focus when search
    if (positions.length > 0) {
      const bounds = positions.reduce(
        (bounds, latlng) => bounds.extend(latlng),
        new kakao.maps.LatLngBounds()
      );
      kakaoMap.setBounds(bounds);
    }
  }, [
    kakaoMap,
    documents,
    makeOverListener,
    makeOutListener,
    makeClickListener,
  ]);

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
