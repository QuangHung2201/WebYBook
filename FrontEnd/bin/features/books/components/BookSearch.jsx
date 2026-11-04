import SearchInput from '@/components/common/SearchInput/SearchInput';

export default function BookSearch({ value, onChange, onSubmit }) {
  return (
    <SearchInput
      value={value}
      onChange={onChange}
      onSubmit={onSubmit}
      placeholder="Tìm theo tên sách, tác giả, thể loại..."
      ariaLabel="Tìm kiếm sách"
    />
  );
}
