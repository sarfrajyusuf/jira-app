import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/router";

//TODO: remove temp flag isActive later and use showAlert as the source of truth
const useReloadConfirmations = (isActive = true) => {
  const [showAlert, setShowAlert] = useState(false);
  const router = useRouter();

  const handleBeforeUnload = useCallback(
    (event: BeforeUnloadEvent) => {
      if (!isActive || !showAlert) return;
      event.preventDefault();
      event.returnValue = "";
    },
    [isActive, showAlert]
  );

  const handleRouteChangeStart = useCallback(
    (url: string) => {
      if (!isActive || !showAlert) return;
      const leave = confirm("Are you sure you want to leave? Changes you made may not be saved.");
      if (!leave) {
        router.events.emit("routeChangeError");
        throw `Route change to "${url}" was aborted (this error can be safely ignored).`;
      }
    },
    [isActive, showAlert, router.events]
  );

  useEffect(() => {
    window.addEventListener("beforeunload", handleBeforeUnload);
    router.events.on("routeChangeStart", handleRouteChangeStart);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      router.events.off("routeChangeStart", handleRouteChangeStart);
    };
  }, [handleBeforeUnload, handleRouteChangeStart, router.events]);

  return { setShowAlert };
};

export default useReloadConfirmations;
