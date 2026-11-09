import clsx from 'clsx';

import classes from './MRT_TableBodyRow.module.css';

import {
  type DragEvent,
  type MouseEvent as ReactMouseEvent,
  memo,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  Box,
  Checkbox,
  MultiSelect,
  Group,
  NumberInput,
  Radio,
  Select,
  type TableProps,
  TableTd,
  TableTr,
  type TableTrProps,
  Textarea,
  TextInput,
} from '@mantine/core';
import { DateInput, DateTimePicker, TimePicker } from '@mantine/dates';

import cellClasses from './MRT_TableBodyCell.module.css';

import { Memo_MRT_TableBodyCell, MRT_TableBodyCell } from './MRT_TableBodyCell';
import { MRT_TableDetailPanel } from './MRT_TableDetailPanel';

import {
  type MRT_BandCell,
  type MRT_BandEditVariant,
  type MRT_BandValidation,
  type MRT_Cell,
  type MRT_ColumnVirtualizer,
  type MRT_DensityState,
  type MRT_Row,
  type MRT_RowData,
  type MRT_RowVirtualizer,
  type MRT_TableInstance,
  type MRT_VirtualItem,
} from '../../types';
import {
  bandLockedColumnSize,
  getBandValidationError,
  getRecordValue,
  groupBandCells,
  splitLeafColumns,
} from '../../utils/bandFormat.utils';
import { getIsRowSelected } from '../../utils/row.utils';
import { parseFromValuesOrFunc } from '../../utils/utils';

const controlSelector =
  'input, textarea, select, button, label, [role="combobox"], [role="checkbox"], [role="listbox"]';

const focusCellControl = (event: ReactMouseEvent<HTMLElement>) => {
  const target = event.target as HTMLElement;
  if (target.closest(controlSelector)) return;
  event.preventDefault();
  event.currentTarget.querySelector<HTMLElement>(controlSelector)?.focus();
};

const writeBandValue = <TData extends MRT_RowData>(
  row: MRT_Row<TData>,
  accessorKey: string,
  next: unknown,
) => {
  //@ts-ignore
  row._valuesCache[accessorKey] = next;
};

const MRT_BandEditControl = <TData extends MRT_RowData>({
  accessorKey,
  checkboxProps,
  dateProps,
  datetimeProps,
  editFormat,
  editOptions = [],
  editValidation,
  editVariant = 'text',
  initialValue,
  maxLength,
  multiSelectProps,
  numberProps,
  radioProps,
  row,
  selectProps,
  textProps,
  textareaProps,
  timeProps,
}: {
  accessorKey: string;
  checkboxProps?: MRT_BandCell<TData>['checkboxProps'];
  dateProps?: MRT_BandCell<TData>['dateProps'];
  datetimeProps?: MRT_BandCell<TData>['datetimeProps'];
  editFormat?: string;
  editOptions?: string[];
  editValidation?: MRT_BandValidation<TData>;
  editVariant?: MRT_BandEditVariant;
  initialValue: unknown;
  maxLength?: number;
  multiSelectProps?: MRT_BandCell<TData>['multiSelectProps'];
  numberProps?: MRT_BandCell<TData>['numberProps'];
  radioProps?: MRT_BandCell<TData>['radioProps'];
  row: MRT_Row<TData>;
  selectProps?: MRT_BandCell<TData>['selectProps'];
  textProps?: MRT_BandCell<TData>['textProps'];
  textareaProps?: MRT_BandCell<TData>['textareaProps'];
  timeProps?: MRT_BandCell<TData>['timeProps'];
}) => {
  const lengthLimit = (limit?: number) =>
    maxLength ?? editValidation?.maxLength ?? limit;
  const stopClick =
    (onClick?: (event: any) => void) =>
    (event: ReactMouseEvent<HTMLElement>) => {
      event.stopPropagation();
      onClick?.(event);
    };
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState(() =>
    getBandValidationError(editValidation, initialValue, row.original),
  );

  const commit = (next: unknown) => {
    setValue(next);
    writeBandValue(row, accessorKey, next);
    setError(getBandValidationError(editValidation, next, row.original));
  };

  if (editVariant === 'checkbox') {
    const checked = value === true || value === 'true';
    return (
      <Checkbox
        {...checkboxProps}
        checked={checked}
        error={error || checkboxProps?.error}
        onChange={(event) => commit(event.currentTarget.checked)}
        onClick={stopClick(checkboxProps?.onClick)}
      />
    );
  }

  if (editVariant === 'radio') {
    return (
      <Radio.Group
        {...radioProps}
        error={error || radioProps?.error}
        name={`${accessorKey}-${row.id}`}
        onChange={commit}
        onClick={stopClick(radioProps?.onClick)}
        value={value == null ? '' : String(value)}
      >
        <Group gap="sm" wrap="wrap">
          {editOptions.map((option) => (
            <Radio key={option} label={option} value={option} />
          ))}
        </Group>
      </Radio.Group>
    );
  }

  if (editVariant === 'select') {
    return (
      <Select
        {...selectProps}
        data={editOptions.length ? editOptions : selectProps?.data}
        error={error || selectProps?.error}
        onChange={commit}
        onClick={stopClick(selectProps?.onClick)}
        value={value == null ? null : String(value)}
      />
    );
  }

  if (editVariant === 'multi-select') {
    const selected = Array.isArray(value) ? value.map(String) : [];
    return (
      <MultiSelect
        {...multiSelectProps}
        data={editOptions.length ? editOptions : multiSelectProps?.data}
        error={error || multiSelectProps?.error}
        onChange={commit}
        onClick={stopClick(multiSelectProps?.onClick)}
        value={selected}
      />
    );
  }

  if (editVariant === 'textarea') {
    return (
      <Textarea
        autosize
        minRows={2}
        {...textareaProps}
        error={error || textareaProps?.error}
        maxLength={lengthLimit(textareaProps?.maxLength)}
        onChange={(event) => commit(event.currentTarget.value)}
        onClick={stopClick(textareaProps?.onClick)}
        value={value == null ? '' : String(value)}
      />
    );
  }

  if (editVariant === 'number') {
    const numberValue =
      typeof value === 'number' || typeof value === 'string' ? value : '';
    return (
      <NumberInput
        {...numberProps}
        error={error || numberProps?.error}
        maxLength={lengthLimit(numberProps?.maxLength)}
        onChange={commit}
        onClick={stopClick(numberProps?.onClick)}
        value={numberValue}
      />
    );
  }

  if (editVariant === 'date') {
    return (
      <DateInput
        {...dateProps}
        error={error || dateProps?.error}
        onChange={commit}
        onClick={stopClick(dateProps?.onClick)}
        value={value == null || value === '' ? null : String(value)}
        valueFormat={dateProps?.valueFormat ?? (editFormat || 'YYYY-MM-DD')}
        withTime={
          dateProps?.withTime ?? Boolean(editFormat && /[Hhms]/.test(editFormat))
        }
      />
    );
  }

  if (editVariant === 'time') {
    const timeFormat = editFormat || 'HH:mm';
    return (
      <TimePicker
        {...timeProps}
        error={error || timeProps?.error}
        format={timeProps?.format ?? (/[aA]/.test(timeFormat) ? '12h' : '24h')}
        onChange={commit}
        onClick={stopClick(timeProps?.onClick)}
        value={value == null ? '' : String(value)}
        withSeconds={timeProps?.withSeconds ?? /s/.test(timeFormat)}
      />
    );
  }

  if (editVariant === 'datetime') {
    return (
      <DateTimePicker
        {...datetimeProps}
        error={error || datetimeProps?.error}
        onChange={commit}
        onClick={stopClick(datetimeProps?.onClick)}
        value={value == null || value === '' ? null : String(value)}
        valueFormat={
          datetimeProps?.valueFormat ?? (editFormat || 'YYYY-MM-DD HH:mm')
        }
      />
    );
  }

  return (
    <TextInput
      variant="default"
      {...textProps}
      error={error || textProps?.error}
      maxLength={lengthLimit(textProps?.maxLength)}
      onChange={(event) => commit(event.currentTarget.value)}
      onClick={stopClick(textProps?.onClick)}
      value={value == null ? '' : String(value)}
    />
  );
};

interface Props<TData extends MRT_RowData> extends TableTrProps {
  columnVirtualizer?: MRT_ColumnVirtualizer;
  numRows?: number;
  pinnedRowIds?: string[];
  renderedRowIndex?: number;
  row: MRT_Row<TData>;
  rowVirtualizer?: MRT_RowVirtualizer;
  table: MRT_TableInstance<TData>;
  tableProps: Partial<TableProps>;
  virtualRow?: MRT_VirtualItem;
}

export const MRT_TableBodyRow = <TData extends MRT_RowData>({
  children,
  columnVirtualizer,
  numRows,
  pinnedRowIds,
  renderedRowIndex = 0,
  row,
  rowVirtualizer,
  table,
  tableProps,
  virtualRow,
  ...rest
}: Props<TData>) => {
  'use no memo';
  const {
    getState,
    options: {
      bodyFormat,
      createDisplayMode,
      editDisplayMode,
      enableEditing,
      enableRowOrdering,
      enableRowPinning,
      enableStickyFooter,
      enableStickyHeader,
      layoutMode,
      mantineTableBodyRowProps,
      memoMode,
      renderDetailPanel,
      rowPinningDisplayMode,
    },
    refs: { tableFooterRef, tableHeadRef },
    setEditingCell,
    setHoveredRow,
  } = table;
  const {
    density,
    creatingRow,
    draggingColumn,
    draggingRow,
    editingCell,
    editingRow,
    hoveredRow,
    isFullScreen,
    rowPinning,
  } = getState();

  const visibleCells = row.getVisibleCells();

  const { virtualColumns, virtualPaddingLeft, virtualPaddingRight } =
    columnVirtualizer ?? {};

  const isRowSelected = getIsRowSelected({ row, table });
  const isRowPinned = enableRowPinning && row.getIsPinned();
  const isRowStickyPinned =
    isRowPinned && rowPinningDisplayMode?.includes('sticky') && 'sticky';
  const isDraggingRow = draggingRow?.id === row.id;
  const isHoveredRow = hoveredRow?.id === row.id;

  const tableRowProps = {
    ...parseFromValuesOrFunc(mantineTableBodyRowProps, {
      renderedRowIndex,
      row,
      table,
    }),
    ...rest,
  };

  const [bottomPinnedIndex, topPinnedIndex] = useMemo(() => {
    if (
      !enableRowPinning ||
      !isRowStickyPinned ||
      !pinnedRowIds ||
      !row.getIsPinned()
    )
      return [];
    return [
      [...pinnedRowIds].reverse().indexOf(row.id),
      pinnedRowIds.indexOf(row.id),
    ];
  }, [pinnedRowIds, rowPinning]);

  const tableHeadHeight =
    ((enableStickyHeader || isFullScreen) &&
      tableHeadRef.current?.clientHeight) ||
    0;
  const tableFooterHeight =
    (enableStickyFooter && tableFooterRef.current?.clientHeight) || 0;

  const defaultRowHeightByDensity: Record<MRT_DensityState, number> = {
    lg: 61,
    md: 53,
    sm: 45,
    xl: 69,
    xs: 37,
  };

  const rowHeight =
    // @ts-ignore
    parseInt(tableRowProps?.style?.height, 10) ||
    (defaultRowHeightByDensity[density] ?? defaultRowHeightByDensity['md']);

  const handleDragEnter = (_e: DragEvent) => {
    if (enableRowOrdering && draggingRow) {
      setHoveredRow(row);
    }
  };

  const rowRef = useRef<HTMLTableRowElement | null>(null);
  const useBand = Boolean(bodyFormat) && !children;
  const bandRows =
    useBand && bodyFormat ? groupBandCells(bodyFormat) : [undefined];
  const { dataColumns, leading, trailing } = useBand
    ? splitLeafColumns(table.getVisibleLeafColumns())
    : {
        dataColumns: [],
        leading: [],
        trailing: [],
      };

  const renderDisplayBodyCell = (
    column: (typeof leading)[number],
  ) => {
    const cell = visibleCells.find((item) => item.column.id === column.id);
    if (!cell) return null;
    const fixedSize = bandLockedColumnSize(column.id, column.getSize());
    return (
      <MRT_TableBodyCell
        align={fixedSize ? 'center' : undefined}
        cell={cell}
        data-band-fixed={fixedSize ? '' : undefined}
        key={cell.id}
        numRows={numRows}
        onMouseDown={focusCellControl}
        renderedColumnIndex={visibleCells.indexOf(cell)}
        renderedRowIndex={renderedRowIndex}
        rowRef={rowRef}
        rowSpan={bodyFormat?.rows}
        style={
          fixedSize
            ? {
                maxWidth: fixedSize,
                minWidth: fixedSize,
                textAlign: 'center',
                verticalAlign: 'middle',
                width: fixedSize,
              }
            : undefined
        }
        tabIndex={-1}
        table={table}
      />
    );
  };

  const renderBandBodyCell = (cell: MRT_BandCell<TData>) => {
    const column = (cell.colspan ?? 1) === 1 ? dataColumns[cell.col] : undefined;
    const matchedCell = visibleCells.find((item) => {
      const accessorKey = item.column.columnDef.accessorKey;
      if (cell.accessorKey && accessorKey === cell.accessorKey) return true;
      return Boolean(column && item.column.id === column.id);
    }) as MRT_Cell<TData> | undefined;
    const raw = cell.accessorKey
      ? getRecordValue(row.original, cell.accessorKey)
      : column
        ? row.getValue(column.id)
        : undefined;
    const editingEnabled =
      parseFromValuesOrFunc(enableEditing, row) &&
      (!matchedCell ||
        parseFromValuesOrFunc(matchedCell.column.columnDef.enableEditing, row) !==
          false);
    const showInput =
      editingEnabled &&
      !row.getIsGrouped() &&
      !['custom', 'modal'].includes(editDisplayMode ?? '') &&
      (editDisplayMode === 'table' ||
        (createDisplayMode === 'row' && creatingRow?.id === row.id) ||
        editingRow?.id === row.id ||
        (matchedCell && editingCell?.id === matchedCell.id));

    const accessorKey =
      cell.accessorKey ?? matchedCell?.column.id ?? column?.id;
    const editVariant =
      cell.editVariant ??
      (matchedCell?.column.columnDef.editVariant as
        | MRT_BandEditVariant
        | undefined) ??
      'text';

    return (
      <TableTd
        className={clsx(cellClasses.root, cellClasses['band-cell'])}
        colSpan={cell.colspan ?? 1}
        key={`${cell.row}-${cell.col}`}
        onDoubleClick={() => {
          if (editingEnabled && editDisplayMode === 'cell' && matchedCell) {
            setEditingCell(matchedCell);
          }
        }}
        onMouseDown={showInput ? focusCellControl : undefined}
        rowSpan={cell.rowspan ?? 1}
        tabIndex={-1}
      >
        {showInput && accessorKey ? (
          <MRT_BandEditControl
            accessorKey={accessorKey}
            checkboxProps={cell.checkboxProps}
            dateProps={cell.dateProps}
            datetimeProps={cell.datetimeProps}
            editFormat={cell.editFormat}
            editOptions={cell.editOptions}
            editValidation={cell.editValidation}
            multiSelectProps={cell.multiSelectProps}
            numberProps={cell.numberProps}
            radioProps={cell.radioProps}
            selectProps={cell.selectProps}
            textProps={cell.textProps}
            textareaProps={cell.textareaProps}
            timeProps={cell.timeProps}
            editVariant={editVariant}
            initialValue={raw}
            maxLength={cell.maxLength}
            row={row}
          />
        ) : raw == null ? (
          ''
        ) : (
          String(raw)
        )}
      </TableTd>
    );
  };

  let striped = tableProps.striped as boolean | string;

  if (striped) {
    if (striped === true) {
      striped = 'odd';
    }
    if (striped === 'odd' && renderedRowIndex % 2 !== 0) {
      striped = false;
    }
    if (striped === 'even' && renderedRowIndex % 2 === 0) {
      striped = false;
    }
  }

  return (
    <>
      {bandRows.map((bandCells, bandRowIndex) => (
        <TableTr
          data-band-row={useBand ? bandRowIndex : undefined}
          data-dragging-row={isDraggingRow || undefined}
          data-hovered-row-target={isHoveredRow || undefined}
          data-index={
            renderDetailPanel ? renderedRowIndex * 2 : renderedRowIndex
          }
          data-row-pinned={isRowStickyPinned || isRowPinned || undefined}
          data-selected={isRowSelected || undefined}
          data-striped={striped}
          key={`${row.id}-${bandRowIndex}`}
          onDragEnter={handleDragEnter}
          ref={(node: HTMLTableRowElement) => {
            if (node && bandRowIndex === 0) {
              rowRef.current = node;
              rowVirtualizer?.measureElement(node);
            }
          }}
          {...tableRowProps}
          __vars={{
            ...tableRowProps?.__vars,
            '--mrt-pinned-row-bottom':
              !virtualRow && bottomPinnedIndex !== undefined && isRowPinned
                ? `${
                    bottomPinnedIndex * rowHeight +
                    (enableStickyFooter ? tableFooterHeight - 1 : 0)
                  }`
                : undefined,
            '--mrt-pinned-row-top': virtualRow
              ? undefined
              : topPinnedIndex !== undefined && isRowPinned
                ? `${
                    topPinnedIndex * rowHeight +
                    (enableStickyHeader || isFullScreen
                      ? tableHeadHeight - 1
                      : 0)
                  }`
                : undefined,
            '--mrt-virtual-row-start': virtualRow
              ? `${virtualRow.start}`
              : undefined,
          }}
          className={clsx(
            classes.root,
            layoutMode?.startsWith('grid') && classes['root-grid'],
            virtualRow && classes['root-virtualized'],
            tableRowProps?.className,
          )}
        >
          {bandCells ? (
            <>
              {bandRowIndex === 0
                ? leading.map((column) => renderDisplayBodyCell(column))
                : null}
              {bandCells.map((cell) => renderBandBodyCell(cell))}
              {bandRowIndex === 0
                ? trailing.map((column) => renderDisplayBodyCell(column))
                : null}
            </>
          ) : (
            <>
              {virtualPaddingLeft ? (
                <Box component="td" display="flex" w={virtualPaddingLeft} />
              ) : null}
              {children
                ? children
                : (virtualColumns ?? row.getVisibleCells()).map(
                    (cellOrVirtualCell, renderedColumnIndex) => {
                      let cell = cellOrVirtualCell as MRT_Cell<TData>;
                      if (columnVirtualizer) {
                        renderedColumnIndex = (
                          cellOrVirtualCell as MRT_VirtualItem
                        ).index;
                        cell = visibleCells[renderedColumnIndex];
                      }
                      const cellProps = {
                        cell,
                        numRows,
                        renderedColumnIndex,
                        renderedRowIndex,
                        rowRef,
                        table,
                        virtualCell: columnVirtualizer
                          ? (cellOrVirtualCell as MRT_VirtualItem)
                          : undefined,
                      };
                      return memoMode === 'cells' &&
                        cell.column.columnDef.columnDefType === 'data' &&
                        !draggingColumn &&
                        !draggingRow &&
                        editingCell?.id !== cell.id &&
                        editingRow?.id !== row.id ? (
                        <Memo_MRT_TableBodyCell key={cell.id} {...cellProps} />
                      ) : (
                        <MRT_TableBodyCell key={cell.id} {...cellProps} />
                      );
                    },
                  )}
              {virtualPaddingRight ? (
                <Box component="td" display="flex" w={virtualPaddingRight} />
              ) : null}
            </>
          )}
        </TableTr>
      ))}
      {renderDetailPanel && !row.getIsGrouped() && (
        <MRT_TableDetailPanel
          parentRowRef={rowRef}
          renderedRowIndex={renderedRowIndex}
          row={row}
          rowVirtualizer={rowVirtualizer}
          striped={striped}
          table={table}
          virtualRow={virtualRow}
        />
      )}
    </>
  );
};

export const Memo_MRT_TableBodyRow = memo(
  MRT_TableBodyRow,
  (prev, next) => prev.row === next.row,
) as typeof MRT_TableBodyRow;
