export interface ValidationError {
  field: string;
  message: string;
}

export function validateLoginForm(data: {
  store_id: string;
  username: string;
  password: string;
}): ValidationError[] {
  const errors: ValidationError[] = [];
  if (!data.store_id.trim()) {
    errors.push({ field: 'store_id', message: '매장 식별자를 입력해주세요' });
  }
  if (!data.username.trim()) {
    errors.push({ field: 'username', message: '사용자명을 입력해주세요' });
  } else if (data.username.length > 50) {
    errors.push({ field: 'username', message: '사용자명은 50자 이내로 입력해주세요' });
  }
  if (!data.password) {
    errors.push({ field: 'password', message: '비밀번호를 입력해주세요' });
  } else if (data.password.length < 8) {
    errors.push({ field: 'password', message: '비밀번호는 8자 이상이어야 합니다' });
  }
  return errors;
}

export function validateTableForm(data: {
  table_number: string;
  password: string;
}): ValidationError[] {
  const errors: ValidationError[] = [];
  const num = parseInt(data.table_number, 10);
  if (!data.table_number.trim() || isNaN(num) || num <= 0) {
    errors.push({ field: 'table_number', message: '유효한 테이블 번호를 입력해주세요 (양의 정수)' });
  }
  if (!data.password) {
    errors.push({ field: 'password', message: '비밀번호를 입력해주세요' });
  } else if (data.password.length < 4) {
    errors.push({ field: 'password', message: '비밀번호는 4자 이상이어야 합니다' });
  }
  return errors;
}

export function validateMenuForm(data: {
  name: string;
  price: string;
  category_id: string;
  description?: string;
}): ValidationError[] {
  const errors: ValidationError[] = [];
  if (!data.name.trim()) {
    errors.push({ field: 'name', message: '메뉴명을 입력해주세요' });
  } else if (data.name.length > 100) {
    errors.push({ field: 'name', message: '메뉴명은 100자 이내로 입력해주세요' });
  }
  const price = parseInt(data.price, 10);
  if (!data.price.trim() || isNaN(price) || price < 0) {
    errors.push({ field: 'price', message: '유효한 가격을 입력해주세요 (0 이상)' });
  }
  if (!data.category_id) {
    errors.push({ field: 'category_id', message: '카테고리를 선택해주세요' });
  }
  if (data.description && data.description.length > 500) {
    errors.push({ field: 'description', message: '설명은 500자 이내로 입력해주세요' });
  }
  return errors;
}

export function validateStoreForm(data: { name: string }): ValidationError[] {
  const errors: ValidationError[] = [];
  if (!data.name.trim()) {
    errors.push({ field: 'name', message: '매장명을 입력해주세요' });
  } else if (data.name.length > 100) {
    errors.push({ field: 'name', message: '매장명은 100자 이내로 입력해주세요' });
  }
  return errors;
}

export function validateStaffForm(data: {
  username: string;
  password: string;
  isEdit?: boolean;
}): ValidationError[] {
  const errors: ValidationError[] = [];
  if (!data.username.trim()) {
    errors.push({ field: 'username', message: '사용자명을 입력해주세요' });
  } else if (data.username.length > 50) {
    errors.push({ field: 'username', message: '사용자명은 50자 이내로 입력해주세요' });
  }
  if (!data.isEdit && !data.password) {
    errors.push({ field: 'password', message: '비밀번호를 입력해주세요' });
  }
  if (data.password && data.password.length < 8) {
    errors.push({ field: 'password', message: '비밀번호는 8자 이상이어야 합니다' });
  }
  return errors;
}

export function validateCategoryForm(data: { name: string }): ValidationError[] {
  const errors: ValidationError[] = [];
  if (!data.name.trim()) {
    errors.push({ field: 'name', message: '카테고리명을 입력해주세요' });
  } else if (data.name.length > 50) {
    errors.push({ field: 'name', message: '카테고리명은 50자 이내로 입력해주세요' });
  }
  return errors;
}
