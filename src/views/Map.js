import { useRef, useState } from "react";
import KakaoMap from "../utils/KakaoMap";
import axios from "axios";

const find = (query) => {
  return axios.get("https://dapi.kakao.com/v2/local/search/keyword", {
    params: {
      query: query,
    },
    headers: {
      Authorization: `KakaoAK ${process.env.REACT_APP_API_APPKEY}`,
    },
  });
};

const Map = () => {
  const [documents, setDocuments] = useState([]);

  const inputRef = useRef(null);

  const onClickSearchBtn = async (e) => {
    const res = await find(inputRef.current.value);
    setDocuments(res.data.documents);
  };

  const onKeyUpSearchInput = async (e) => {
    if (e.key === "Enter") {
      const res = await find(inputRef.current.value);
      setDocuments(res.data.documents);
    }
  };

  return (
    <div>
      <input
        id="input"
        type="text"
        ref={inputRef}
        onKeyUp={onKeyUpSearchInput}
      />
      <button type="button" onClick={onClickSearchBtn}>
        search
      </button>
      <KakaoMap documents={documents} size={[1000, 800]} />
    </div>
  );
};

export default Map;
