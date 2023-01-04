import { useEffect } from "react";

export default function ExitPage() {
  useEffect(() => {
    window.close();
  }, []);

  return <></>;
}
