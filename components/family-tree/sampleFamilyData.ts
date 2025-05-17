export const sampleFamilyData = {
  rootId: "nguyen-van-a",
  members: [
    // First generation
    {
      id: "nguyen-van-a",
      name: "Nguyễn Văn A",
      birthYear: 1940,
      deathYear: 2010,
      generation: 1,
      gender: "male",
      spouseId: "tran-thi-b",
      children: ["nguyen-van-c", "nguyen-thi-d", "nguyen-van-e"],
    },
    {
      id: "tran-thi-b",
      name: "Trần Thị B",
      birthYear: 1945,
      deathYear: 2015,
      generation: 1,
      gender: "female",
      spouseId: "nguyen-van-a",
      children: ["nguyen-van-c", "nguyen-thi-d", "nguyen-van-e"],
    },

    // Second generation - first branch
    {
      id: "nguyen-van-c",
      name: "Nguyễn Văn C",
      birthYear: 1965,
      generation: 2,
      gender: "male",
      spouseId: "le-thi-f",
      children: ["nguyen-van-i", "nguyen-thi-j"],
    },
    {
      id: "le-thi-f",
      name: "Lê Thị F",
      birthYear: 1968,
      generation: 2,
      gender: "female",
      spouseId: "nguyen-van-c",
      children: ["nguyen-van-i", "nguyen-thi-j"],
    },

    // Second generation - second branch
    {
      id: "nguyen-thi-d",
      name: "Nguyễn Thị D",
      birthYear: 1970,
      generation: 2,
      gender: "female",
      spouseId: "pham-van-g",
      children: ["pham-thi-k", "pham-van-l"],
    },
    {
      id: "pham-van-g",
      name: "Phạm Văn G",
      birthYear: 1968,
      generation: 2,
      gender: "male",
      spouseId: "nguyen-thi-d",
      children: ["pham-thi-k", "pham-van-l"],
    },

    // Second generation - third branch
    {
      id: "nguyen-van-e",
      name: "Nguyễn Văn E",
      birthYear: 1975,
      generation: 2,
      gender: "male",
      spouseId: "hoang-thi-h",
      children: ["nguyen-van-m", "nguyen-thi-n"],
    },
    {
      id: "hoang-thi-h",
      name: "Hoàng Thị H",
      birthYear: 1978,
      generation: 2,
      gender: "female",
      spouseId: "nguyen-van-e",
      children: ["nguyen-van-m", "nguyen-thi-n"],
    },

    // Third generation - first branch children
    {
      id: "nguyen-van-i",
      name: "Nguyễn Văn I",
      birthYear: 1990,
      generation: 3,
      gender: "male",
      spouseId: "tran-thi-o",
      children: ["nguyen-van-q"],
    },
    {
      id: "tran-thi-o",
      name: "Trần Thị O",
      birthYear: 1992,
      generation: 3,
      gender: "female",
      spouseId: "nguyen-van-i",
      children: ["nguyen-van-q"],
    },
    {
      id: "nguyen-thi-j",
      name: "Nguyễn Thị J",
      birthYear: 1995,
      generation: 3,
      gender: "female",
    },

    // Third generation - second branch children
    {
      id: "pham-thi-k",
      name: "Phạm Thị K",
      birthYear: 1992,
      generation: 3,
      gender: "female",
    },
    {
      id: "pham-van-l",
      name: "Phạm Văn L",
      birthYear: 1995,
      generation: 3,
      gender: "male",
      spouseId: "le-thi-p",
      children: ["pham-van-r", "pham-thi-s"],
    },
    {
      id: "le-thi-p",
      name: "Lê Thị P",
      birthYear: 1997,
      generation: 3,
      gender: "female",
      spouseId: "pham-van-l",
      children: ["pham-van-r", "pham-thi-s"],
    },

    // Third generation - third branch children
    {
      id: "nguyen-van-m",
      name: "Nguyễn Văn M",
      birthYear: 2000,
      generation: 3,
      gender: "male",
    },
    {
      id: "nguyen-thi-n",
      name: "Nguyễn Thị N",
      birthYear: 2005,
      generation: 3,
      gender: "female",
    },

    // Fourth generation
    {
      id: "nguyen-van-q",
      name: "Nguyễn Văn Q",
      birthYear: 2015,
      generation: 4,
      gender: "male",
    },
    {
      id: "pham-van-r",
      name: "Phạm Văn R",
      birthYear: 2018,
      generation: 4,
      gender: "male",
    },
    {
      id: "pham-thi-s",
      name: "Phạm Thị S",
      birthYear: 2020,
      generation: 4,
      gender: "female",
    },
  ],
}
