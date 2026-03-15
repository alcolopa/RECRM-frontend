// Static Lebanon location data
// Country → Governorate → City/Town hierarchy

export interface LocationCity {
  name: string;
}

export interface LocationGovernorate {
  name: string;
  cities: LocationCity[];
}

export interface LocationCountry {
  name: string;
  governorates: LocationGovernorate[];
}

export const LEBANON_DATA: LocationCountry = {
  name: 'Lebanon',
  governorates: [
    {
      name: 'Beirut',
      cities: [
        { name: 'Achrafieh' },
        { name: 'Hamra' },
        { name: 'Verdun' },
        { name: 'Ras Beirut' },
        { name: 'Gemmayze' },
        { name: 'Mar Mikhael' },
        { name: 'Badaro' },
        { name: 'Sin el Fil' },
        { name: 'Ain el Mreisseh' },
        { name: 'Mazraa' },
        { name: 'Bachoura' },
        { name: 'Minet el Hosn' },
        { name: 'Moussaitbeh' },
        { name: 'Clemenceau' },
        { name: 'Downtown' },
        { name: 'Saifi' },
      ],
    },
    {
      name: 'Mount Lebanon',
      cities: [
        { name: 'Jounieh' },
        { name: 'Jbeil (Byblos)' },
        { name: 'Baabda' },
        { name: 'Aley' },
        { name: 'Chouf' },
        { name: 'Keserwan' },
        { name: 'Metn' },
        { name: 'Broummana' },
        { name: 'Bikfaya' },
        { name: 'Dbayeh' },
        { name: 'Zouk Mosbeh' },
        { name: 'Zouk Mikael' },
        { name: 'Ajaltoun' },
        { name: 'Ghazir' },
        { name: 'Harissa' },
        { name: 'Adma' },
        { name: 'Ballouneh' },
        { name: 'Antelias' },
        { name: 'Jal el Dib' },
        { name: 'Mansourieh' },
        { name: 'Beit Mery' },
        { name: 'Hazmieh' },
        { name: 'Yarze' },
        { name: 'Deir el Qamar' },
        { name: 'Beiteddine' },
        { name: 'Damour' },
        { name: 'Naameh' },
        { name: 'Khalde' },
        { name: 'Amchit' },
        { name: 'Laqlouq' },
        { name: 'Faraya' },
        { name: 'Kfour' },
      ],
    },
    {
      name: 'North Lebanon',
      cities: [
        { name: 'Tripoli' },
        { name: 'Mina' },
        { name: 'Zgharta' },
        { name: 'Ehden' },
        { name: 'Bcharre' },
        { name: 'Batroun' },
        { name: 'Koura' },
        { name: 'Chekka' },
        { name: 'Anfeh' },
        { name: 'Amioun' },
        { name: 'Tannourine' },
        { name: 'Blaouza' },
        { name: 'Douma' },
        { name: 'Hasroun' },
        { name: 'El Arz (The Cedars)' },
      ],
    },
    {
      name: 'South Lebanon',
      cities: [
        { name: 'Sidon (Saida)' },
        { name: 'Jezzine' },
        { name: 'Tyre (Sour)' },
        { name: 'Nabatieh' },
        { name: 'Bint Jbeil' },
        { name: 'Marjayoun' },
        { name: 'Hasbaya' },
        { name: 'Khiam' },
        { name: 'Zahrani' },
        { name: 'Arnoun' },
      ],
    },
    {
      name: 'Beqaa',
      cities: [
        { name: 'Zahle' },
        { name: 'Chtaura' },
        { name: 'Baalbek' },
        { name: 'Hermel' },
        { name: 'Anjar' },
        { name: 'Rashaya' },
        { name: 'Joubb Jannine' },
        { name: 'Saghbine' },
        { name: 'Deir el Ahmar' },
        { name: 'Brital' },
        { name: 'Labwe' },
        { name: 'Faqra' },
        { name: 'Aana' },
      ],
    },
    {
      name: 'Nabatieh',
      cities: [
        { name: 'Nabatieh' },
        { name: 'Bint Jbeil' },
        { name: 'Marjayoun' },
        { name: 'Hasbaya' },
        { name: 'Khiam' },
        { name: 'Kfar Tibnit' },
      ],
    },
    {
      name: 'Akkar',
      cities: [
        { name: 'Halba' },
        { name: 'Qoubaiyat' },
        { name: 'Bebnine' },
        { name: 'Beino' },
        { name: 'Fnaideq' },
        { name: 'Akkar el Atika' },
      ],
    },
    {
      name: 'Baalbek-Hermel',
      cities: [
        { name: 'Baalbek' },
        { name: 'Hermel' },
        { name: 'Deir el Ahmar' },
        { name: 'Labwe' },
        { name: 'Brital' },
        { name: 'Ras Baalbek' },
        { name: 'Arsal' },
        { name: 'Bouday' },
      ],
    },
  ],
};

// Helper function to get all countries (currently Lebanon only)
export const getCountries = (): string[] => {
  return [LEBANON_DATA.name];
};

// Helper function to get governorates for a country
export const getGovernorates = (country: string): string[] => {
  if (country === LEBANON_DATA.name) {
    return LEBANON_DATA.governorates.map((g) => g.name);
  }
  return [];
};

// Helper function to get cities for a governorate
export const getCities = (country: string, governorate: string): string[] => {
  if (country === LEBANON_DATA.name) {
    const gov = LEBANON_DATA.governorates.find((g) => g.name === governorate);
    return gov ? gov.cities.map((c) => c.name) : [];
  }
  return [];
};
