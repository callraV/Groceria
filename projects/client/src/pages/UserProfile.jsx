import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FaPen, FaPlus, FaTrash } from "react-icons/fa";
import {
  Button,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  FormControl,
  FormLabel,
  Input,
  ModalFooter,
} from "@chakra-ui/react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { getAddress } from "../features/addressSlice";

function UserProfile() {
  const dispatch = useDispatch();
  // const userToken = localStorage.getItem("user_token");
  const userGlobal = useSelector((state) => state.user.user);
  const userAddress = useSelector((state) => state.address.address);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setselectedAddress] = useState(null);

  const {
    isOpen: isAddOpen,
    onOpen: onAddOpen,
    onClose: onAddClose,
  } = useDisclosure();
  const {
    isOpen: isEditOpen,
    onOpen: onEditOpen,
    onClose: onEditClose,
  } = useDisclosure();

  const initialRef = useRef();
  const navigate = useNavigate();

  // const fetchAddresses = async () => {
  //   try {
  //     const response = await axios.get(
  //       `http://localhost:8000/api/addresses/${userGlobal.user_id}`
  //     );
  //     setAddresses(response.data.data);
  //   } catch (error) {
  //     console.error(error);
  //   }
  // };

  const handleDeleteAddress = async (address_id) => {
    try {
      const response = await axios.delete(
        `http://localhost:8000/api/addresses/${address_id}`
      );
      console.log(response.data);
      alert(response.data.message);
    } catch (error) {
      console.error(error);
    }
  };

  const handleEditAddress = (address) => {
    setselectedAddress(address);
    onEditOpen();
  };

  useEffect(() => {
    if (!userGlobal.user_id == "") {
      dispatch(getAddress(userGlobal.user_id));
    }
  }, [userGlobal]);

  useEffect(() => {
    setAddresses(userAddress);
  }, [userAddress]);

  const renderAddresses = () => {
    return addresses.map((address) => (
      <div
        key={address.address_id}
        className="w-full md:w-[48%] lg:w-[49%] p-2 border border-pink-500 rounded-md  shadow-md"
      >
        <div className="flex">
          <div className="flex flex-row items-center border-gray-200 rounded overflow-hidden w-1/2 gap-2 px-1">
            <div>
              <p className="text-lg font-semibold text-pink-500 ">Alamat:</p>
              <p className="text-md font-medium">
                {address.street}, {address.city}, {address.province}
              </p>
            </div>
          </div>
          <div className="flex flex-col justify-center gap-1 items-center w-1/2 border-l-2">
            <div
              className="px-2 py-1 rounded bg-teal-500 hover:bg-teal-600 font-semibold text-white w-1/2 flex items-center justify-center gap-1 cursor-pointer"
              onClick={() => handleEditAddress(address)}
            >
              <FaPen size={15} />
              <p>Edit</p>
            </div>
            <div
              className="px-2 py-1 rounded bg-rose-500 hover:bg-rose-600 font-semibold text-white w-1/2 flex items-center justify-center gap-1 cursor-pointer"
              onClick={() => handleDeleteAddress(address.address_id)}
            >
              <FaTrash size={15} />
              <p>Delete</p>
            </div>
          </div>
        </div>
      </div>
    ));
  };

  const getCoordinates = async (storeLocation) => {
    try {
      const response = await axios.get(
        "https://api.opencagedata.com/geocode/v1/json",
        {
          params: {
            key: "9f48b305cf314d489b980f43d69e0cab",
            q: storeLocation,
          },
        }
      );
      const data = response.data;
      if (data.results && data.results.length > 0) {
        return data.results[0].geometry;
      } else {
        // Data lokasi tidak ditemukan
        alert("Location not found!");
      }
    } catch (error) {
      console.error(error);
      alert("There was an error fetching the coordinates.");
    }
  };

  const ModalAddAddress = () => {
    const [addressStreet, setaddressStreet] = useState("");
    const [addressCity, setaddressCity] = useState("");
    const [addressProvince, setaddressProvince] = useState("");

    const handleSubmit = async () => {
      const coordinates = getCoordinates(
        `${addressStreet}, ${addressCity}, ${addressProvince}`
      );
      const formData = new FormData();
      formData.append("street", addressStreet);
      formData.append("city", addressCity);
      formData.append("province", addressProvince);
      formData.append("longitude", coordinates.lng);
      formData.append("latitude", coordinates.lat);
      formData.append("user_id", userGlobal.user_id);

      try {
        const response = await axios.post(
          "http://localhost:8000/api/addresses",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        alert(response.data.message);
        onAddClose();
        // fetchAddresses();
      } catch (error) {
        console.error(error);
      }
    };

    return (
      <Modal
        initialFocusRef={initialRef}
        isOpen={isAddOpen}
        onClose={onAddClose}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add Address</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <FormControl>
              <FormLabel>Street</FormLabel>
              <Input
                ref={initialRef}
                placeholder="Enter Street"
                value={addressStreet}
                onChange={(e) => setaddressStreet(e.target.value)}
              />
            </FormControl>
            <FormControl>
              <FormLabel>City</FormLabel>
              <Input
                placeholder="Enter City"
                value={addressCity}
                onChange={(e) => setaddressCity(e.target.value)}
              />
            </FormControl>
            {addressCity}
            <FormControl>
              <FormLabel>Province</FormLabel>
              <Input
                placeholder="Enter Province"
                value={addressProvince}
                onChange={(e) => setaddressProvince(e.target.value)}
              />
            </FormControl>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="green" mr={3} onClick={handleSubmit}>
              Save
            </Button>
            <Button colorScheme="red" onClick={onAddClose}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    );
  };

  const ModalEditAddress = () => {
    const [addressStreet, setaddressStreet] = useState("");
    const [addressCity, setaddressCity] = useState("");
    const [addressProvince, setaddressProvince] = useState("");

    const handleSubmit = async () => {
      const coordinates = getCoordinates(
        `${addressStreet}, ${addressCity}, ${addressProvince}`
      );
      const formData = new FormData();
      formData.append("street", addressStreet);
      formData.append("city", addressCity);
      formData.append("province", addressProvince);
      formData.append("longitude", coordinates.lng);
      formData.append("latitude", coordinates.lat);
      formData.append("user_id", userGlobal.user_id);

      try {
        const response = await axios.put(
          `http://localhost:8000/api/addresses/${selectedAddress.address_id}`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        alert(response.data.message);
        onAddClose();
        // fetchAddresses();
      } catch (error) {
        console.error(error);
      }
    };

    useEffect(() => {
      if (selectedAddress) {
        setaddressStreet(selectedAddress.street);
        setaddressCity(selectedAddress.city);
        setaddressProvince(selectedAddress.province);
      }
    }, [selectedAddress]);

    return (
      <Modal
        initialFocusRef={initialRef}
        isOpen={isEditOpen}
        onClose={onEditClose}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Address</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <FormControl>
              <FormLabel>Street</FormLabel>
              <Input
                ref={initialRef}
                placeholder="Enter Street"
                value={addressStreet}
                onChange={(e) => setaddressStreet(e.target.value)}
              />
            </FormControl>
            <FormControl>
              <FormLabel>City</FormLabel>
              <Input
                ref={initialRef}
                placeholder="Enter City"
                value={addressCity}
                onChange={(e) => setaddressCity(e.target.value)}
              />
            </FormControl>
            <FormControl>
              <FormLabel>Province</FormLabel>
              <Input
                ref={initialRef}
                placeholder="Enter Province"
                value={addressProvince}
                onChange={(e) => setaddressProvince(e.target.value)}
              />
            </FormControl>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="green" mr={3} onClick={handleSubmit}>
              Save
            </Button>
            <Button colorScheme="red" onClick={onEditClose}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    );
  };

  // useEffect(() => {
  //   if (userGlobal.user_id == "") {
  //     alert("You haven't Login!");
  //     navigate("/login");
  //   } else {
  //     fetchAddresses();
  //   }
  // }, [userGlobal]);

  return (
    <div className="w-[95%] flex-col sm:max-w-2xl md:max-w-4xl mx-auto mt-5">
      <div className="p-4 bg-white border shadow-md rounded">
        <div className="w-full bg-slate-100 text-center py-6 rounded-md mb-10">
          <p className="font-semibold text-pink-500 text-lg">
            Address Management
          </p>
        </div>
        <div className="flex justify-end">
          <button
            onClick={onAddOpen}
            className="bg-pink-500 hover:bg-pink-600 font-semibold text-white py-2 px-4 rounded-md mb-2 flex items-center"
          >
            <FaPlus size={15} className="mr-2" /> Add Address
          </button>
        </div>
        <div className="flex flex-wrap justify-center gap-4">
          {renderAddresses()}
          <ModalAddAddress />
          <ModalEditAddress />
        </div>
      </div>
    </div>
  );
}

export default UserProfile;
