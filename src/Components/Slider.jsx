import React from "react";
import { Box } from "@mui/material";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import SwwedyLogo from "../assets/sewedy2.png";
import Wezara from "../assets/wzara.png";
import Iats from "../assets/iats.png";

const logos = [SwwedyLogo, Wezara, Iats];

// Function to duplicate slides if there are fewer than slidesPerView
const extendedLogos = logos.length < 6 ? [...logos, ...logos] : logos;

const SliderPartners = () => {
  return (
    <Box
      sx={{
        width: "100%",
        padding: "40px 20px",
        maxWidth: "1200px",
        margin: "0 auto",
        position: "relative",
      }}
    >
      <Swiper
        slidesPerView={3} // Number of slides visible
        spaceBetween={40} // Gap between slides
        loop={true} // Enable infinite loop
        speed={1000} // Smooth sliding speed (1s transition)
        autoplay={{
          delay: 2500,
          disableOnInteraction: false,
        }}
        navigation={{
          nextEl: ".swiper-button-next",
          prevEl: ".swiper-button-prev",
        }}
        pagination={{
          clickable: true,
          el: ".swiper-pagination",
          dynamicBullets: true,
        }}
        modules={[Autoplay, Navigation, Pagination]}
      >
        {extendedLogos.map((logo, index) => (
          <SwiperSlide key={index}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "200px",
              }}
            >
              <Box
                component="img"
                src={logo}
                alt={`Partner Logo ${index + 1}`}
                sx={{
                  width: "100%",
                  height: "auto",
                  maxWidth: "200px",
                  objectFit: "contain",
                }}
              />
            </Box>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Pagination */}
      <Box
        className="swiper-pagination"
        sx={{
          position: "absolute",
          bottom: "0",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 10,
          marginTop: "20px",
        }}
      />

      {/* Navigation Arrows */}
      {["prev", "next"].map((dir) => (
        <Box
          key={dir}
          className={`swiper-button-${dir}`}
          sx={{
            position: "absolute",
            top: "50%",
            [dir === "prev" ? "left" : "right"]: "10px",
            zIndex: 10,
            cursor: "pointer",
            color: "#000",
            backgroundColor: "rgba(255, 255, 255, 0.8)",
            borderRadius: "50%",
            width: "40px",
            height: "40px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            "&::after": {
              content: `"${dir === "prev" ? "←" : "→"}"`,
              fontSize: "24px",
              fontWeight: "bold",
            },
          }}
        />
      ))}
    </Box>
  );
};

export default SliderPartners;
