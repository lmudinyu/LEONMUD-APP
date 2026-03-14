import React from "react";
import { motion } from "framer-motion";

export default function Loader() {
  return (
    <div style={{
      height: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      background: "#87CEEB",
      fontFamily: "Times New Roman, serif",
      flexDirection: "column",
      color: "white"
    }}>
      <motion.h1
        animate={{ scale: [1, 1.3, 1] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        LEONMUD Student Tracker
      </motion.h1>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        style={{
          width: 50,
          height: 50,
          border: "5px solid white",
          borderTop: "5px solid #001f3f",
          borderRadius: "50%",
          marginTop: 20
        }}
      />
      <p style={{ marginTop: 20 }}>Loading your tracking experience...</p>
    </div>
  );
}
