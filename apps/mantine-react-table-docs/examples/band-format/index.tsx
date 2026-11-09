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

const cities = ['서울', '부산', '대구'] as const;
const grades = ['일반', '우수', 'VIP'] as const;

const data: Contact[] = Array.from({ length: 10 }, (_, index) => {
  const city = cities[index % cities.length];
  const day = String((index % 28) + 1).padStart(2, '0');
  const hour = String(index % 24).padStart(2, '0');
  const minute = String((index * 7) % 60).padStart(2, '0');

  return {
    active: index % 2 === 0,
    amount: (index % 11) * 1000,
    city,
    grade: grades[index % grades.length],
    meeting: `2026-11-${day} ${hour}:${minute}`,
    memo: `${city} ${index + 1}`,
    name: `회원${index + 1}`,
    visitDate: `2026-11-${day}`,
    visitTime: `${hour}:${minute}`,
  };
});

const Example = () => {
  const columns = useMemo<MRT_ColumnDef<Contact>[]>(
    () => [
      { accessorKey: 'name', header: 'name', size: 140 },
      { accessorKey: 'city', header: 'city', size: 140 },
      { accessorKey: 'active', header: 'active', size: 90 },
      { accessorKey: 'visitDate', header: 'visitDate', size: 150 },
      { accessorKey: 'visitTime', header: 'visitTime', size: 130 },
      { accessorKey: 'amount', header: 'amount', size: 120 },
      { accessorKey: 'grade', header: 'grade', grow: 1 },
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
      enableColumnResizing={true}
      enableRowSelection={true}
      enableRowNumbers={true}
      editDisplayMode="table"
      enableColumnActions={false}
      enableColumnFilters
      enableSorting
      enableEditing
      enableRowVirtualization={true}
      rowVirtualizerOptions={{
        overscan: 10,
      }}
      initialState={{
        columnPinning: { left: ['mrt-row-select','mrt-row-numbers','name', ] },
      }}
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
          {
            accessorKey: 'name',
            col: 0,
            textProps: { placeholder: '이름' },
            editValidation: { required: true },
            editVariant: 'text',
            maxLength: 10,
            row: 0,
            rowspan: 2,
          },
          {
            accessorKey: 'city',
            col: 1,
            editOptions: ['서울', '부산', '대구'],
            editVariant: 'select',
            selectProps: { placeholder: '지역' },
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
          {
            accessorKey: 'visitTime',
            col: 4,
            editFormat: 'HH:mm',
            editVariant: 'time',
            row: 0,
          },
          {
            accessorKey: 'amount',
            col: 5,
            editValidation: { max: 10000, min: 0 },
            editVariant: 'number',
            row: 0,
          },
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
            textareaProps: { minRows: 2, placeholder: '메모' },
            editValidation: { maxLength: 20 },
            editVariant: 'textarea',
            maxLength: 20,
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
