import { useEffect, useState } from "react";

interface Province {
  code: number;
  name: string;
  districts: District[];
}

interface District {
  code: number;
  name: string;
  wards: Ward[];
}

interface Ward {
  code: number;
  name: string;
}

const useAddressData = () => {
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [selectedProvince, setSelectedProvince] = useState<number | "">("");
  const [selectedDistrict, setSelectedDistrict] = useState<number | "">("");
  const [selectedWard, setSelectedWard] = useState<number | "">("");

  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/provinces");
        const data = await res.json();
 
        if (Array.isArray(data)) {
          setProvinces(data);
        } else {
          console.error("Dữ liệu trả về không phải mảng:", data);
          setProvinces([]);
        }
      } catch (err) {
        console.error("Lỗi khi tải danh sách tỉnh:", err);
        setProvinces([]);
      }
    };
    fetchProvinces();
  }, []);


  useEffect(() => {
    if (!selectedProvince) {
      setDistricts([]);
      setWards([]);
      return;
    }
    const province = provinces.find((p) => p.code === selectedProvince);
    setDistricts(province ? province.districts : []);
    setWards([]);
  }, [selectedProvince, provinces]);

  useEffect(() => {
    if (!selectedDistrict) {
      setWards([]);
      return;
    }
    const district = districts.find((d) => d.code === selectedDistrict);
    setWards(district ? district.wards : []);
  }, [selectedDistrict, districts]);

  const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedProvince(Number(e.target.value));
    setSelectedDistrict("");
    setSelectedWard("");
  };

  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDistrict(Number(e.target.value));
    setSelectedWard("");
  };

  const handleWardChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedWard(Number(e.target.value));
  };

  return {
    provinces,
    districts,
    wards,
    selectedProvince,
    selectedDistrict,
    selectedWard,
    handleProvinceChange,
    handleDistrictChange,
    handleWardChange,
  };
};

export default useAddressData;
