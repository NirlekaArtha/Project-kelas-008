import gsap from "gsap";
import { forwardRef, useRef, useState } from "react";

export default function LoginPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const signInRef = useRef<HTMLDivElement>(null);
  const signUpRef = useRef<HTMLDivElement>(null);
  const welcomeRef = useRef<HTMLDivElement>(null);

  const [isSignin, setIsSignin] = useState(true);

  const handleSwitchSignUp = () => {
    setIsSignin(!isSignin);
    const signInAnimation = {
      scale: isSignin ? 0.8 : 1,
      duration: 0.5,
      ease: "power1.out",
    };
    const signUpAnimation = {
      scale: isSignin ? 1 : 0.8,
      duration: 0.5,
      ease: "power1.out",
    };
    const welcomeAnimation = {
      x: isSignin ? "-100%" : 0,
      borderTopRightRadius: isSignin ? 170 : 0,
      borderBottomRightRadius: isSignin ? 170 : 0,
      borderTopLeftRadius: isSignin ? 0 : 170,
      borderBottomLeftRadius: isSignin ? 0 : 170,
      duration: 0.5,
      ease: "power1.out",
    };
    const tl = gsap.timeline();
    tl.to(signInRef.current, signInAnimation)
      .to(signUpRef.current, signUpAnimation, "<")
      .to(welcomeRef.current, welcomeAnimation, "<");
    console.log(isSignin);
  };
  return (
    <main className="text-text font-mukta flex h-screen items-center justify-center bg-radial-[at_50%_-50%] from-gray-800 to-black">
      <div
        ref={containerRef}
        className="relative flex h-2/3 w-2/3 items-center justify-between overflow-hidden rounded-xl bg-gray-800 shadow-xl shadow-lime-600/50"
      >
        {/* sign in  */}
        <Authlayout ref={signInRef} name="sign in" />
        {/* sign up */}
        <Authlayout ref={signUpRef} name="sign up" />
        {/* text welcome */}
        <div
          ref={welcomeRef}
          className="absolute right-0 z-100 flex h-full w-1/2 flex-1 flex-col items-center justify-center gap-5 rounded-l-[170px] bg-lime-500 px-5 text-black"
        >
          <h1 className="font-parkinsans text-5xl font-semibold">
            {isSignin ? "halo, kawan" : "welcome!!"}
          </h1>
          <p className="text-center text-xl">
            {isSignin
              ? "kalo belum punya akun bisa bikin dulu yaa, klik tombol dibawah"
              : "dah ada akun? klik tombol dibawah"}
          </p>
          <button
            onClick={handleSwitchSignUp}
            className="cursor-pointer rounded-lg border-3 border-black bg-transparent px-10 py-2 text-lg duration-200 hover:bg-black hover:text-lime-500 active:scale-95"
          >
            {isSignin ? "Sign up" : "sign in"}
          </button>
        </div>
      </div>
    </main>
  );
}

const Authlayout = forwardRef<HTMLDivElement, { name: string }>(
  ({ name }, ref) => {
    return (
      <div ref={ref} className="flex flex-1 flex-col items-center gap-10 px-10">
        <h1 className="font-parkinsans text-5xl font-semibold text-lime-500">
          {name}
        </h1>

        {/* form */}
        <form className="flex w-full flex-col gap-2">
          <div className="flex flex-col gap-4">
            <InputForm type="email" name="Email" />
            <InputForm type="password" name="Password" />
            {name === "sign up" && <InputForm type="text" name="username" />}
          </div>

          {name === "sign in" && (
            <a href="#" className="text-sm text-lime-500 hover:text-lime-600">
              {" "}
              forgot password?
            </a>
          )}

          {/* button submit*/}
          <button
            type="submit"
            className="mt-10 cursor-pointer rounded-lg bg-lime-500 px-5 py-3 text-xl text-black duration-200 hover:bg-lime-600 active:scale-95"
          >
            {name}
          </button>
        </form>
      </div>
    );
  },
);

const InputForm = ({ type, name }: { type: string; name: string }) => {
  return (
    <input
      type={type}
      placeholder={name}
      autoComplete="off"
      className="rounded-lg bg-black/20 p-2 text-lg focus:ring-0 focus:outline-2 focus:outline-lime-500"
    />
  );
};
