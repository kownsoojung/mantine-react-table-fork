import { useMemo } from 'react';

import { Box } from '@mantine/core';
import { MantineReactTable, type MRT_ColumnDef } from 'mantine-react-table-open';

type Contact = {
  active: boolean;
  amount: number;
  city: string;
  grade: string;
  meeting: string;
  memo: string;
  name: string;
  visitDate: string;
  visitTime: string;
};

const data: Contact[] = [
  {
    active: true,
    amount: 12000,
    city: '서울',
    grade: '우수',
    meeting: '2026-11-09 14:00',
    memo: '서울시 중구 세종대로 110',
    name: '김민수',
    visitDate: '2026-11-09',
    visitTime: '09:30',
  },
  {
    active: false,
    amount: 8000,
    city: '부산',
    grade: '일반',
    meeting: '2026-11-10 11:15',
    memo: '부산시 해운대구 우동 123',
    name: '이서연',
    visitDate: '2026-11-10',
    visitTime: '13:00',
  },
  {
    active: true,
    amount: 15000,
    city: '대구',
    grade: 'VIP',
    meeting: '2026-11-11 16:45',
    memo: '대구시 중구 동성로 45',
    name: '박지훈',
    visitDate: '2026-11-11',
    visitTime: '10:20',
  },
];

const Example = () => {
  const columns = useMemo<MRT_ColumnDef<Contact>[]>(
    () => [
      { accessorKey: 'name', header: 'name', size: 140 },
      { accessorKey: 'city', header: 'city', size: 140 },
      { accessorKey: 'active', header: 'active', size: 90 },
      { accessorKey: 'visitDate', header: 'visitDate', size: 150 },
      { accessorKey: 'visitTime', header: 'visitTime', size: 130 },
      { accessorKey: 'amount', header: 'amount', size: 120 },
      { accessorKey: 'grade', header: 'grade', size: 220 },
    ],
    [],
  );

  return (
    <Box
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100dvh - 220px)',
        minHeight: 320,
      }}
    >
      <MantineReactTable
      columns={columns}
      data={data}
      displayColumnDefOptions={{
        'mrt-row-numbers': { size: 56 },
        'mrt-row-select': { size: 48 },
      }}
      enableRowSelection={true}
      enableRowNumbers={true}
      editDisplayMode="table"
      enableColumnActions={false}
      enableColumnFilters={false}
      enableEditing
      enablePagination={false}
      enableStickyHeader
      enableTableFooter={false}
      enableTopToolbar={false}
      headFormat={{
        cells: [
          { col: 0, row: 0, rowspan: 2, text: '이름' },
          { col: 1, row: 0, text: '지역' },
          { col: 2, row: 0, text: '회원' },
          { col: 3, row: 0, text: '방문일' },
          { col: 4, row: 0, text: '시간' },
          { col: 5, row: 0, text: '금액' },
          { col: 6, row: 0, rowspan: 2, text: '등급' },
          { col: 1, colspan: 3, row: 1, text: '메모' },
          { col: 4, colspan: 2, row: 1, text: '일시' },
        ],
        rows: 2,
      }}
      bodyFormat={{
        cells: [
          { accessorKey: 'name', col: 0, editVariant: 'text', row: 0, rowspan: 2 },
          {
            accessorKey: 'city',
            col: 1,
            editOptions: ['서울', '부산', '대구'],
            editVariant: 'select',
            row: 0,
          },
          { accessorKey: 'active', col: 2, editVariant: 'checkbox', row: 0 },
          {
            accessorKey: 'visitDate',
            col: 3,
            editFormat: 'YYYY.MM.DD',
            editVariant: 'date',
            row: 0,
          },
          { accessorKey: 'visitTime', col: 4, editVariant: 'time', row: 0 },
          { accessorKey: 'amount', col: 5, editVariant: 'number', row: 0 },
          {
            accessorKey: 'grade',
            col: 6,
            editOptions: ['일반', '우수', 'VIP'],
            editVariant: 'radio',
            row: 0,
            rowspan: 2,
          },
          {
            accessorKey: 'memo',
            col: 1,
            colspan: 3,
            editVariant: 'textarea',
            row: 1,
          },
          {
            accessorKey: 'meeting',
            col: 4,
            colspan: 2,
            editVariant: 'datetime',
            row: 1,
          },
        ],
        rows: 2,
      }}
      mantinePaperProps={{
        style: {
          display: 'flex',
          flex: 1,
          flexDirection: 'column',
          height: '100%',
          minHeight: 0,
        },
      }}
      mantineTableContainerProps={{
        style: {
          flex: '1 1 auto',
          maxHeight: 'none',
          minHeight: 0,
        },
      }}
      mantineTableProps={{
        highlightOnHover: true,
        striped: 'odd',
        withColumnBorders: true,
        withRowBorders: true,
        withTableBorder: true,
      }}
      />
    </Box>
  );
};

export default Example;
