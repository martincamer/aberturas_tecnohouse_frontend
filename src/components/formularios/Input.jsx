export const Input = ({ type, placeholder, register }) => {
  return (
    <input
      {...register(type, { required: true })}
      type={type}
      placeholder={placeholder}
      className="rounded-md py-[8px] px-2 w-full border-gray-300 border-[1px] bg-white outline-none  outline-[1px] placeholder:text-sm max-md:text-sm font-medium"
    />
  );
};
