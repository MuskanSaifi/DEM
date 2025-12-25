"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image"; // ✅ import Image from next/image

const DownloadAppPage = () => {
  const router = useRouter();

  useEffect(() => {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    const isAndroid = /android/i.test(userAgent);
    const isIOS = /iPad|iPhone|iPod/.test(userAgent) && !window.MSStream;
    const isMac = /Macintosh|Mac OS X/.test(userAgent);
    const isWindows = /Windows/.test(userAgent);

    if (isAndroid || isWindows) {
      // Android mobile OR Windows desktop
      window.location.href =
        "https://play.google.com/store/apps/details?id=com.nazim_saifi.dialexportmart";
    } else if (isIOS || isMac) {
      // iPhone, iPad, or Mac
      window.location.href =
        "https://apps.apple.com/in/app/dialexportmart/id6751717591?platform=iphone";
    } else {
      // Fallback for unknown devices
      router.push("/");
    }
  }, [router]);

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        backgroundColor: "#f9fafb",
        color: "#111",
      }}
    >
      <Image
        src="/assets/logo1234.png" // ✅ correct path
        alt="Dial Export Mart"
        width={100}
        height={100}
        style={{ marginBottom: 20 }}
        priority
      />
      <h2>Redirecting you to our app…</h2>
      <p style={{ color: "#555", marginTop: 8 }}>
        Hang tight, this will only take a moment.
      </p>
    </div>
  );
};

export default DownloadAppPage;
