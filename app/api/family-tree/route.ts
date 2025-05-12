import { NextResponse } from "next/server"

// This would typically come from your database
const familyTreeData = {
  name: "Nguyễn Văn Tổ",
  attributes: {
    birthYear: 1920,
    deathYear: 2000,
    gender: "male",
    occupation: "Nông dân",
  },
  children: [
    {
      name: "Nguyễn Văn Trưởng",
      attributes: {
        birthYear: 1945,
        deathYear: 2015,
        gender: "male",
        occupation: "Giáo viên",
      },
      children: [
        {
          name: "Nguyễn Văn Minh",
          attributes: {
            birthYear: 1970,
            gender: "male",
            occupation: "Kỹ sư",
          },
          children: [
            {
              name: "Nguyễn Văn Tuấn",
              attributes: {
                birthYear: 1995,
                gender: "male",
                occupation: "Lập trình viên",
              },
            },
            {
              name: "Nguyễn Thị Mai",
              attributes: {
                birthYear: 1998,
                gender: "female",
                occupation: "Sinh viên",
              },
            },
          ],
        },
        {
          name: "Nguyễn Thị Hương",
          attributes: {
            birthYear: 1975,
            gender: "female",
            spouse: "Trần Văn Bình",
            occupation: "Giáo viên",
          },
          children: [
            {
              name: "Trần Văn Hùng",
              attributes: {
                birthYear: 2000,
                gender: "male",
                occupation: "Sinh viên",
              },
            },
          ],
        },
      ],
    },
    {
      name: "Nguyễn Văn Thứ",
      attributes: {
        birthYear: 1950,
        gender: "male",
        occupation: "Bác sĩ",
      },
      children: [
        {
          name: "Nguyễn Văn Đức",
          attributes: {
            birthYear: 1980,
            gender: "male",
            occupation: "Doanh nhân",
          },
          children: [
            {
              name: "Nguyễn Văn Phúc",
              attributes: {
                birthYear: 2005,
                gender: "male",
                occupation: "Học sinh",
              },
            },
            {
              name: "Nguyễn Thị Lan",
              attributes: {
                birthYear: 2008,
                gender: "female",
                occupation: "Học sinh",
              },
            },
          ],
        },
      ],
    },
    {
      name: "Nguyễn Thị Út",
      attributes: {
        birthYear: 1955,
        gender: "female",
        occupation: "Kế toán",
      },
    },
  ],
}

export async function GET() {
  // In a real application, you would fetch this data from your database
  return NextResponse.json(familyTreeData)
}
