// app/styles/style.ts
export const containerStyle = {
  maxWidth: "400px",
  margin: "50px auto",
  textAlign: "center",
  padding: "30px",
  border: "1px solid #ddd",
  borderRadius: "8px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  backgroundColor: "#fff",
};

export const nameRowStyle = {
  display: "flex",
  alignItems: "center",
  gap: "12px", // 0.75rem 정도
  marginBottom: "16px",
  maxWidth: "350px",
};

export const nameLabelStyle = {
  width: "96px",
  fontWeight: "400",
};

export const nameInputStyle = {
  padding: "6px 10px",
  border: "1px solid #ccc",
  borderRadius: "4px",
  fontSize: "1rem",
  width: "150px",
  boxSizing: "border-box",
};

export const birthlabelStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '6px',
  marginBottom: '12px',
};

export const birthspanStyle = {
  fontSize: '14px',
  color: '#333',
};

export const birthinputStyle = {
  padding: '6px 8px',
  border: '1px solid #ccc',
  borderRadius: '4px',
  fontSize: '14px',
};

export const phoneLabelStyle = {
  display: 'flex',
  flexDirection: 'row', // 가로 정렬
  alignItems: 'center', // 세로 가운데 정렬
  gap: '10px', // 요소 사이 간격
  marginBottom: '12px',
};

export const phoneSpanStyle = {
  fontSize: '14px',
  color: '#333',
  minWidth: '100px', // 라벨 고정 너비(필요하면 조절)
};

export const phoneInputStyle = {
  padding: '6px 8px',
  border: '1px solid #ccc',
  borderRadius: '4px',
  fontSize: '14px',
  minWidth: '100px', // 최소 너비 지정 가능
};

export const addressLabelStyle = {
  display: 'flex',
  alignItems: 'center',  // 세로 가운데 정렬
  gap: '10px',           // span과 input 사이 간격
  marginBottom: '12px',
};

export const addressSpanStyle = {
  width: '100px',       // 라벨 너비 고정해서 정렬 깔끔하게
  fontSize: '14px',
  color: '#333',
};

export const addressInputStyle = {
  flex: 1,              // 남은 공간 다 차지하게
  padding: '6px 8px',
  border: '1px solid #ccc',
  borderRadius: '4px',
  fontSize: '14px',
  boxSizing: 'border-box',
};

export const upperDepartmentContainer = {
  display: "flex",
  gap: "1.5rem",
  alignItems: "flex-start",
  marginBottom: "1rem",
}

export const upperDepartmentLabelContainer = {
  display: "flex",
  flexDirection: "column",
  minWidth: "180px",
}

export const upperDepartmentLabelText = {
  marginBottom: 6,
  fontWeight: 400,
  fontSize: 14,
}

export const upperDepartmentSelect = {
  padding: "6px 10px",
  fontSize: 14,
  borderRadius: 4,
  border: "1px solid #ccc",
}

export const lowerDepartmentLabelContainer = {
  display: "flex",
  flexDirection: "column",
  minWidth: "180px",
}

export const lowerDepartmentLabelText = {
  marginBottom: 6,
  fontWeight: 400,
  fontSize: 14,
}

export const lowerDepartmentSelect = {
  padding: "6px 10px",
  fontSize: 14,
  borderRadius: 4,
  border: "1px solid #ccc",
}

export const careerDateLabel = {
  display: "flex",
  flexDirection: "column",
  gap: "6px",
}