import { useMemo } from 'react';

import { MantineReactTable, type MRT_ColumnDef } from 'mantine-react-table-open';

type Contact = {
  address: string;
  email: string;
  name: string;
  phone: string;
};

const data: Contact[] = [
  {
    address: '서울시 중구 세종대로 110',
    email: 'kim@example.com',
    name: '김민수',
    phone: '010-1111-2222',
  },
  {
    address: '부산시 해운대구 우동 123',
    email: 'lee@example.com',
    name: '이서연',
    phone: '010-3333-4444',
  },
  {
    address: '대구시 중구 동성로 45',
    email: 'park@example.com',
    name: '박지훈',
    phone: '010-5555-6666',
  },
];

const Example = () => {
  const columns = useMemo<MRT_ColumnDef<Contact>[]>(
    () => [
      { accessorKey: 'name', header: 'name', size: 140 },
      { accessorKey: 'phone', header: 'phone', size: 180 },
      { accessorKey: 'email', header: 'email', size: 220 },
    ],
    [],
  );

  return (
    <MantineReactTable
      columns={columns}
      data={data}
      enableColumnActions={false}
      enableColumnFilters={false}
      enablePagination={false}
      enableTableFooter={false}
      headFormat={{
        cells: [
          { col: 0, row: 0, rowspan: 2, text: '이름' },
          { col: 1, colspan: 2, row: 0, text: '연락처' },
          { col: 1, row: 1, text: '전화' },
          { col: 2, row: 1, text: '이메일' },
        ],
        rows: 2,
      }}
      bodyFormat={{
        cells: [
          { accessorKey: 'name', col: 0, row: 0, rowspan: 2 },
          { accessorKey: 'phone', col: 1, row: 0 },
          { accessorKey: 'email', col: 2, row: 0 },
          { accessorKey: 'address', col: 1, colspan: 2, row: 1 },
        ],
        rows: 2,
      }}
      mantineTableProps={{
        highlightOnHover: true,
        striped: 'odd',
        withColumnBorders: true,
        withRowBorders: true,
        withTableBorder: true,
      }}
    />
  );
};

export default Example;
