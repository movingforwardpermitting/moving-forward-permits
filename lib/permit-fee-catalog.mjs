// Permit reference data transcribed from Moving_Forward_50_State_Trip_Fuel_Fees_Verified.xlsx
// and Moving_Forward_Permit_Fee_Official_Source_References.txt (research date 2026-11-06).
// These are research starting amounts, not an assurance of current state/provider checkout price.
// Unknown, variable, conditional, and unavailable fees never default to zero.
export const permitFeeReferences = {
  "Alabama": {
    "Trip Permit": {
      "feeCents": 2000,
      "feeText": "$20",
      "duration": "7 days",
      "status": "fixed",
      "source": "https://www.revenue.alabama.gov/wp-content/uploads/2021/12/810-5-1-.470.pdf",
      "researchDate": "2026-11-06"
    },
    "Fuel Permit": {
      "feeCents": 2000,
      "feeText": "$20",
      "duration": "7 days",
      "status": "fixed",
      "source": "https://www.revenue.alabama.gov/wp-content/uploads/2021/12/810-5-1-.470.pdf",
      "researchDate": "2026-11-06"
    },
    "Trip + Fuel Permit": {
      "feeCents": 4000,
      "feeText": "$40 state trip+fuel combination",
      "status": "fixed",
      "duration": "7 days",
      "source": "https://www.revenue.alabama.gov/wp-content/uploads/2021/12/810-5-1-.470.pdf",
      "researchDate": "2026-11-06",
      "orderingNote": "Confirm state issues one combination permit; service-count and final fees must be verified."
    }
  },
  "Alaska": {
    "Trip Permit": {
      "feeText": "$350 (commercial truck TRT)",
      "duration": "30 days",
      "status": "conditional",
      "source": "https://dmv.alaska.gov/vehicle-services/commercial-trip-permits-temporary-registration-for-truck-or-trailer-trt/",
      "researchDate": "2026-11-06"
    },
    "Fuel Permit": {
      "feeText": "N/A (not an IFTA state)",
      "duration": "Not specified",
      "status": "unavailable",
      "source": "https://dmv.alaska.gov/vehicle-services/commercial-trip-permits-temporary-registration-for-truck-or-trailer-trt/",
      "researchDate": "2026-11-06"
    }
  },
  "Arizona": {
    "Trip Permit": {
      "feeText": "Variable: mileage + axles; surcharge",
      "duration": "96 hours",
      "status": "variable",
      "source": "https://azdot.gov/mvd/services/enforcement/commercial-vehicle-permits/general-permit-information/single-trip-permits",
      "orderingNote": "Own login (types to confirm)",
      "researchDate": "2026-11-06"
    },
    "Fuel Permit": {
      "feeText": "$16 (<=50 miles); $65 (>50 miles)",
      "duration": "96 hours",
      "status": "variable",
      "source": "https://azdot.gov/mvd/services/enforcement/commercial-vehicle-permits/general-permit-information/single-trip-permits",
      "researchDate": "2026-11-06"
    }
  },
  "Arkansas": {
    "Trip Permit": {
      "feeCents": 3300,
      "feeText": "$33",
      "duration": "72 hours",
      "status": "fixed",
      "source": "https://dmv.ny.gov/forms/irp8.pdf",
      "orderingNote": "Own login",
      "researchDate": "2026-11-06"
    },
    "Fuel Permit": {
      "feeText": "Fuel purchase or weigh-station permit",
      "duration": "Trip / weigh station",
      "status": "unavailable",
      "source": "https://dmv.ny.gov/forms/irp8.pdf",
      "orderingNote": "Fuel purchase / weigh station",
      "researchDate": "2026-11-06"
    }
  },
  "California": {
    "Trip Permit": {
      "feeCents": 4500,
      "feeText": "$45",
      "duration": "4 days",
      "status": "fixed",
      "source": "https://www.dmv.ca.gov/portal/handbook/dismantlers-handbook-of-registration-procedures/appendix-1f-fees/",
      "researchDate": "2026-11-06"
    },
    "Fuel Permit": {
      "feeCents": 3000,
      "feeText": "$30",
      "duration": "4 days",
      "status": "fixed",
      "source": "https://www.dmv.ca.gov/portal/handbook/dismantlers-handbook-of-registration-procedures/appendix-1f-fees/",
      "researchDate": "2026-11-06"
    }
  },
  "Colorado": {
    "Trip Permit": {
      "feeText": "$60–$80 (depends on weight)",
      "duration": "72 hours",
      "status": "variable",
      "source": "https://dmv.ny.gov/forms/irp8.pdf",
      "researchDate": "2026-11-06"
    },
    "Fuel Permit": {
      "feeText": "$1 + estimated fuel tax (4 mpg)",
      "duration": "72 hours",
      "status": "variable",
      "source": "https://content.leg.colorado.gov/sites/default/files/images/olls/crs2024-title-39.pdf",
      "researchDate": "2026-11-06"
    }
  },
  "Connecticut": {
    "Trip Permit": {
      "feeCents": 1500,
      "feeText": "$15",
      "duration": "72 hours",
      "status": "fixed",
      "source": "https://portal.ct.gov/dmv/resources/dmv-fees",
      "researchDate": "2026-11-06"
    },
    "Fuel Permit": {
      "feeText": "Not confirmed",
      "duration": "Not confirmed",
      "status": "unconfirmed",
      "source": "https://portal.ct.gov/dmv/resources/dmv-fees",
      "researchDate": "2026-11-06"
    }
  },
  "Delaware": {
    "Trip Permit": {
      "feeCents": 1500,
      "feeText": "$15",
      "duration": "72 hours",
      "status": "fixed",
      "source": "https://delcode.delaware.gov/title21/c021/sc01/",
      "researchDate": "2026-11-06"
    },
    "Fuel Permit": {
      "feeText": "Not confirmed",
      "duration": "Not confirmed",
      "status": "unconfirmed",
      "source": "https://delcode.delaware.gov/title21/c021/sc01/",
      "researchDate": "2026-11-06"
    }
  },
  "Florida": {
    "Trip Permit": {
      "feeCents": 3000,
      "feeText": "$30",
      "duration": "10 days",
      "status": "fixed",
      "source": "https://www.flhsmv.gov/pdf/forms/85920.pdf",
      "researchDate": "2026-11-06"
    },
    "Fuel Permit": {
      "feeCents": 4500,
      "feeText": "$45",
      "duration": "10 days",
      "status": "fixed",
      "source": "https://dmv.ny.gov/forms/irp8.pdf",
      "researchDate": "2026-11-06"
    }
  },
  "Georgia": {
    "Trip Permit": {
      "feeCents": 3000,
      "feeText": "$30",
      "duration": "72 hours",
      "status": "fixed",
      "source": "https://dor.georgia.gov/georgia-trucking-portal-faqs",
      "orderingNote": "State portal (accessible)",
      "researchDate": "2026-11-06"
    },
    "Fuel Permit": {
      "feeCents": 1600,
      "feeText": "$16",
      "duration": "10 days",
      "status": "fixed",
      "source": "https://dmv.ny.gov/forms/irp8.pdf",
      "researchDate": "2026-11-06"
    }
  },
  "Hawaii": {
    "Trip Permit": {
      "feeText": "N/A (not an IRP state)",
      "duration": "Not specified",
      "status": "unavailable",
      "source": "https://oklahoma.gov/tax/businesses/ifta.html",
      "researchDate": "2026-11-06"
    },
    "Fuel Permit": {
      "feeText": "N/A (not an IFTA state)",
      "duration": "Not specified",
      "status": "unavailable",
      "source": "https://oklahoma.gov/tax/businesses/ifta.html",
      "researchDate": "2026-11-06"
    }
  },
  "Idaho": {
    "Trip Permit": {
      "feeCents": 6000,
      "feeText": "$60 single / $120 combination",
      "duration": "120 hours",
      "status": "fixed",
      "source": "https://dmv.ny.gov/forms/irp8.pdf",
      "researchDate": "2026-11-06"
    },
    "Fuel Permit": {
      "feeCents": 6000,
      "feeText": "$60",
      "duration": "120 hours",
      "status": "fixed",
      "source": "https://dmv.ny.gov/forms/irp8.pdf",
      "researchDate": "2026-11-06"
    }
  },
  "Illinois": {
    "Trip Permit": {
      "feeCents": 1900,
      "feeText": "$19",
      "duration": "72 hours",
      "status": "fixed",
      "source": "https://dmv.ny.gov/forms/irp8.pdf",
      "researchDate": "2026-11-06"
    },
    "Fuel Permit": {
      "feeCents": 4000,
      "feeText": "$40",
      "duration": "96 hours",
      "status": "fixed",
      "source": "https://tax.illinois.gov/content/dam/soi/en/web/tax/research/publications/documents/motorfuel/mfut-53.pdf",
      "researchDate": "2026-11-06"
    }
  },
  "Indiana": {
    "Trip Permit": {
      "feeCents": 1500,
      "feeText": "$15",
      "duration": "72 hours",
      "status": "fixed",
      "source": "https://dmv.ny.gov/forms/irp8.pdf",
      "researchDate": "2026-11-06"
    },
    "Fuel Permit": {
      "feeCents": 5000,
      "feeText": "$50",
      "duration": "5 days",
      "status": "fixed",
      "source": "https://www.in.gov/dor/motor-carrier-services/files/cmv-guidebook.pdf",
      "researchDate": "2026-11-06"
    }
  },
  "Iowa": {
    "Trip Permit": {
      "feeCents": 1000,
      "feeText": "$10",
      "duration": "72 hours",
      "status": "fixed",
      "source": "https://iowadot.gov/motor-carriers/how-do-i-get-oversize-overweight-permits/permit-types",
      "orderingNote": "Own login: ia.gotpermits.com",
      "researchDate": "2026-11-06"
    },
    "Fuel Permit": {
      "feeCents": 2000,
      "feeText": "$20",
      "duration": "1 trip / 72 hours",
      "status": "fixed",
      "source": "https://iowadot.gov/motor-carriers/how-do-i-get-oversize-overweight-permits/permit-types",
      "researchDate": "2026-11-06"
    }
  },
  "Kansas": {
    "Trip Permit": {
      "feeCents": 2600,
      "feeText": "$26 (interstate IRP)",
      "duration": "72 hours",
      "status": "fixed",
      "source": "https://www.irponline.org/members/?id=13000530",
      "orderingNote": "Own login",
      "researchDate": "2026-11-06"
    },
    "Fuel Permit": {
      "feeText": "$13 / $25",
      "duration": "24 hours / 72 hours",
      "status": "conditional",
      "source": "https://www.ksrevenue.gov/faqs-motorfuel.html",
      "orderingNote": "Own login",
      "researchDate": "2026-11-06"
    }
  },
  "Kentucky": {
    "Trip Permit": {
      "feeText": "$40 standard; $25 special <=55k",
      "duration": "10 days (standard)",
      "status": "conditional",
      "source": "https://drive.ky.gov/Motor-Carriers/Pages/IFTA.aspx",
      "orderingNote": "State portal (accessible)",
      "researchDate": "2026-11-06"
    },
    "Fuel Permit": {
      "feeCents": 4000,
      "feeText": "$40",
      "duration": "Duration: confirm in portal",
      "status": "fixed",
      "source": "https://dmv.ny.gov/forms/irp8.pdf",
      "orderingNote": "State portal (accessible)",
      "researchDate": "2026-11-06"
    }
  },
  "Louisiana": {
    "Trip Permit": {
      "feeCents": 5000,
      "feeText": "$50",
      "duration": "48 hours",
      "status": "fixed",
      "source": "https://wwwapps.dotd.la.gov/administration/dotdaz/definition.aspx?termID=532",
      "researchDate": "2026-11-06"
    },
    "Fuel Permit": {
      "feeText": "Not confirmed",
      "duration": "Not confirmed",
      "status": "unconfirmed",
      "source": "https://wwwapps.dotd.la.gov/administration/dotdaz/definition.aspx?termID=532",
      "researchDate": "2026-11-06"
    }
  },
  "Maine": {
    "Trip Permit": {
      "feeCents": 2500,
      "feeText": "$25",
      "duration": "72 hours",
      "status": "fixed",
      "source": "https://www.mainelegislature.org/legis/statutes/29-A/title29-Asec525.html",
      "orderingNote": "Email application to state",
      "researchDate": "2026-11-06"
    },
    "Fuel Permit": {
      "feeCents": 5000,
      "feeText": "$50",
      "duration": "72 hours",
      "status": "fixed",
      "source": "https://dmv.ny.gov/forms/irp8.pdf",
      "researchDate": "2026-11-06"
    }
  },
  "Maryland": {
    "Trip Permit": {
      "feeCents": 1500,
      "feeText": "$15",
      "duration": "72 hours",
      "status": "fixed",
      "source": "https://dmv.ny.gov/forms/irp8.pdf",
      "researchDate": "2026-11-06"
    },
    "Fuel Permit": {
      "feeText": "Not confirmed",
      "duration": "Not confirmed",
      "status": "unconfirmed",
      "source": "https://dmv.ny.gov/forms/irp8.pdf",
      "researchDate": "2026-11-06"
    }
  },
  "Massachusetts": {
    "Trip Permit": {
      "feeCents": 1500,
      "feeText": "$15",
      "duration": "72 hours",
      "status": "fixed",
      "source": "https://www.mass.gov/doc/rmv-schedule-of-fees/download",
      "researchDate": "2026-11-06"
    },
    "Fuel Permit": {
      "feeCents": 2000,
      "feeText": "$20",
      "duration": "72 hours",
      "status": "fixed",
      "source": "https://dmv.ny.gov/forms/irp8.pdf",
      "researchDate": "2026-11-06"
    }
  },
  "Michigan": {
    "Trip Permit": {
      "feeCents": 2000,
      "feeText": "$20",
      "duration": "72 hours",
      "status": "fixed",
      "source": "https://www.michigan.gov/sos/-/media/Project/Websites/sos/Industry-Services/IRP-resources/IRPmanual.pdf",
      "researchDate": "2026-11-06"
    },
    "Fuel Permit": {
      "feeText": "Not confirmed",
      "duration": "Not confirmed",
      "status": "unconfirmed",
      "source": "https://www.michigan.gov/sos/-/media/Project/Websites/sos/Industry-Services/IRP-resources/IRPmanual.pdf",
      "researchDate": "2026-11-06"
    }
  },
  "Minnesota": {
    "Trip Permit": {
      "feeText": "Variable: 1/12 annual registration",
      "duration": "120 hours",
      "status": "variable",
      "source": "https://www.revisor.mn.gov/statutes/cite/168D.12",
      "researchDate": "2026-11-06"
    },
    "Fuel Permit": {
      "feeCents": 2500,
      "feeText": "$25",
      "duration": "5 days",
      "status": "fixed",
      "source": "https://dmv.ny.gov/forms/irp8.pdf",
      "researchDate": "2026-11-06"
    }
  },
  "Mississippi": {
    "Trip Permit": {
      "feeCents": 2500,
      "feeText": "$25",
      "duration": "72 hours",
      "status": "fixed",
      "source": "https://permits.mdot.ms.gov/PermitFees.pdf",
      "orderingNote": "Own account (registered)",
      "researchDate": "2026-11-06"
    },
    "Fuel Permit": {
      "feeText": "Not offered via your MS process",
      "duration": "N/A for your process",
      "status": "unavailable",
      "source": "https://permits.mdot.ms.gov/PermitFees.pdf",
      "orderingNote": "Not offered via your MS process",
      "researchDate": "2026-11-06"
    }
  },
  "Missouri": {
    "Trip Permit": {
      "feeCents": 1000,
      "feeText": "$10",
      "duration": "72 hours",
      "status": "fixed",
      "source": "https://www.mshp.dps.missouri.gov/WebContent/Brochures/SHP-216.html",
      "researchDate": "2026-11-06"
    },
    "Fuel Permit": {
      "feeCents": 1000,
      "feeText": "$10",
      "duration": "72 hours",
      "status": "fixed",
      "source": "https://www.mshp.dps.missouri.gov/WebContent/Brochures/SHP-216.html",
      "researchDate": "2026-11-06"
    },
    "Trip + Fuel Permit": {
      "feeCents": 2000,
      "feeText": "$20 state trip+fuel combination",
      "status": "fixed",
      "duration": "72 hours",
      "source": "https://www.modot.org/sites/default/files/documents/72HourTripFuelPermit-%20OTR.pdf",
      "researchDate": "2026-11-06",
      "orderingNote": "Confirm state issues one combination permit; service-count and final fees must be verified."
    }
  },
  "Montana": {
    "Trip Permit": {
      "feeText": "$10–$80+ (weight / distance)",
      "duration": "Single trip",
      "status": "variable",
      "source": "https://mca.legmt.gov/bills/mca/title_0610/chapter_0100/part_0010/section_0240/0610-0100-0010-0240.html",
      "researchDate": "2026-11-06"
    },
    "Fuel Permit": {
      "feeCents": 3000,
      "feeText": "$30",
      "duration": "72 hours",
      "status": "fixed",
      "source": "https://dmv.ny.gov/forms/irp8.pdf",
      "researchDate": "2026-11-06"
    }
  },
  "Nebraska": {
    "Trip Permit": {
      "feeCents": 2500,
      "feeText": "$25 (+$2 payment fee)",
      "duration": "72 hours",
      "status": "fixed",
      "source": "https://dmv.nebraska.gov/faq/how-do-i-purchase-fuel-andor-trip-permit-and-what-cost",
      "researchDate": "2026-11-06"
    },
    "Fuel Permit": {
      "feeCents": 2000,
      "feeText": "$20 (+$2 payment fee)",
      "duration": "72 hours",
      "status": "fixed",
      "source": "https://dmv.nebraska.gov/faq/how-do-i-purchase-fuel-andor-trip-permit-and-what-cost",
      "researchDate": "2026-11-06"
    }
  },
  "Nevada": {
    "Trip Permit": {
      "feeText": "$5 + $0.15 / mile",
      "duration": "24 hours",
      "status": "variable",
      "source": "https://dmv.nv.gov/mcpermits.htm",
      "researchDate": "2026-11-06"
    },
    "Fuel Permit": {
      "feeCents": 3000,
      "feeText": "$30",
      "duration": "Duration: confirm",
      "status": "fixed",
      "source": "https://dmv.ny.gov/forms/irp8.pdf",
      "researchDate": "2026-11-06"
    }
  },
  "New Hampshire": {
    "Trip Permit": {
      "feeCents": 1500,
      "feeText": "$15",
      "duration": "72 hours",
      "status": "fixed",
      "source": "https://gc.nh.gov/rules/state_agencies/saf-c300.html",
      "researchDate": "2026-11-06"
    },
    "Fuel Permit": {
      "feeCents": 1000,
      "feeText": "$10",
      "duration": "3 days",
      "status": "fixed",
      "source": "https://dmv.ny.gov/forms/irp8.pdf",
      "researchDate": "2026-11-06"
    }
  },
  "New Jersey": {
    "Trip Permit": {
      "feeCents": 2500,
      "feeText": "$25",
      "duration": "72 hours",
      "status": "fixed",
      "source": "https://www.nj.gov/mvc/pdf/business/IRP_Carrier_Guide.pdf",
      "researchDate": "2026-11-06"
    },
    "Fuel Permit": {
      "feeCents": 2500,
      "feeText": "$25",
      "duration": "96 hours",
      "status": "fixed",
      "source": "https://www.nj.gov/mvc/pdf/business/IRP_Carrier_Guide.pdf",
      "researchDate": "2026-11-06"
    }
  },
  "New Mexico": {
    "Trip Permit": {
      "feeText": "Variable: weight × NM miles",
      "duration": "48 hours",
      "status": "variable",
      "source": "https://www.srca.nm.gov/parts/title03/03.012.0101.html",
      "researchDate": "2026-11-06"
    },
    "Fuel Permit": {
      "feeText": "$5 + $0.05 / NM mile",
      "duration": "Trip-based",
      "status": "variable",
      "source": "https://www.srca.nm.gov/parts/title03/03.012.0101.html",
      "researchDate": "2026-11-06"
    }
  },
  "New York": {
    "Trip Permit": {
      "feeCents": 1875,
      "feeText": "$18.75",
      "duration": "72 hours",
      "status": "fixed",
      "source": "https://dmv.ny.gov/forms/irp8.pdf",
      "researchDate": "2026-11-06"
    },
    "Fuel Permit": {
      "feeCents": 2500,
      "feeText": "$25",
      "duration": "72 hours",
      "status": "fixed",
      "source": "https://www.tax.ny.gov/pdf/memos/fuel_%26_gasoline/m95_14m.pdf",
      "researchDate": "2026-11-06"
    }
  },
  "North Carolina": {
    "Trip Permit": {
      "feeCents": 1500,
      "feeText": "$15",
      "duration": "10 days",
      "status": "fixed",
      "source": "https://www.ncdor.gov/taxes-forms/motor-carrier-tax-iftain/ifta-publications/north-carolina-ifta-and-fuel-use-tax-temporary-trip-permits",
      "researchDate": "2026-11-06"
    },
    "Fuel Permit": {
      "feeCents": 5000,
      "feeText": "$50",
      "duration": "3 days",
      "status": "fixed",
      "source": "https://dmv.ny.gov/forms/irp8.pdf",
      "researchDate": "2026-11-06"
    }
  },
  "North Dakota": {
    "Trip Permit": {
      "feeCents": 2000,
      "feeText": "$20",
      "duration": "72 hours",
      "status": "fixed",
      "source": "https://dmv.ny.gov/forms/irp8.pdf",
      "orderingNote": "Own login (setup pending)",
      "researchDate": "2026-11-06"
    },
    "Fuel Permit": {
      "feeCents": 1500,
      "feeText": "$15",
      "duration": "72 hours",
      "status": "fixed",
      "source": "https://dmv.ny.gov/forms/irp8.pdf",
      "orderingNote": "Own login (setup pending)",
      "researchDate": "2026-11-06"
    }
  },
  "Ohio": {
    "Trip Permit": {
      "feeCents": 1500,
      "feeText": "$15",
      "duration": "72 hours",
      "status": "fixed",
      "source": "https://codes.ohio.gov/ohio-administrative-code/rule-4501:1-8-11",
      "researchDate": "2026-11-06"
    },
    "Fuel Permit": {
      "feeText": "Variable: estimated fuel-use tax",
      "duration": "Trip-based",
      "status": "variable",
      "source": "https://codes.ohio.gov/ohio-administrative-code/rule-4501:1-8-11",
      "researchDate": "2026-11-06"
    }
  },
  "Oklahoma": {
    "Trip Permit": {
      "feeCents": 2200,
      "feeText": "$22",
      "duration": "72 hours",
      "status": "fixed",
      "source": "https://oklahoma.gov/occ/divisions/transportation/trucking/temporary-permits.html",
      "orderingNote": "Comdata available (your access unconfirmed)",
      "researchDate": "2026-11-06"
    },
    "Fuel Permit": {
      "feeCents": 3500,
      "feeText": "$35",
      "duration": "120 hours",
      "status": "fixed",
      "source": "https://oklahoma.gov/occ/divisions/transportation/trucking/temporary-permits.html",
      "orderingNote": "Comdata available (your access unconfirmed)",
      "researchDate": "2026-11-06"
    }
  },
  "Oregon": {
    "Trip Permit": {
      "feeCents": 4300,
      "feeText": "$43",
      "duration": "10 days",
      "status": "fixed",
      "source": "https://www.oregon.gov/odot/mct/pages/weight-mile-temporary-tax-pass.aspx",
      "researchDate": "2026-11-06"
    },
    "Fuel Permit": {
      "feeText": "$9 + weight-mile tax",
      "duration": "10 days / miles purchased",
      "status": "variable",
      "source": "https://www.oregon.gov/odot/mct/pages/weight-mile-temporary-tax-pass.aspx",
      "researchDate": "2026-11-06"
    }
  },
  "Pennsylvania": {
    "Trip Permit": {
      "feeCents": 1500,
      "feeText": "$15",
      "duration": "72 hours",
      "status": "fixed",
      "source": "https://www.pa.gov/agencies/revenue/resources/tax-types-and-information/motor-and-alternative-fuel-taxes/motor-carriers-road-tax/trip-permit-information",
      "researchDate": "2026-11-06"
    },
    "Fuel Permit": {
      "feeCents": 7300,
      "feeText": "$73",
      "duration": "5 days",
      "status": "fixed",
      "source": "https://dmv.ny.gov/forms/irp8.pdf",
      "orderingNote": "Comdata is state-listed (not confirmed yours)",
      "researchDate": "2026-11-06"
    }
  },
  "Rhode Island": {
    "Trip Permit": {
      "feeCents": 2500,
      "feeText": "$25",
      "duration": "72 hours",
      "status": "fixed",
      "source": "https://dmv.ny.gov/forms/irp8.pdf",
      "researchDate": "2026-11-06"
    },
    "Fuel Permit": {
      "feeText": "Not confirmed",
      "duration": "Not confirmed",
      "status": "unconfirmed",
      "source": "https://dmv.ny.gov/forms/irp8.pdf",
      "researchDate": "2026-11-06"
    }
  },
  "South Carolina": {
    "Trip Permit": {
      "feeCents": 1500,
      "feeText": "$15",
      "duration": "72 hours",
      "status": "fixed",
      "source": "https://scdmvonline.com/-/media/Files/Fuel-Trip-Permit-FAQ.ashx",
      "researchDate": "2026-11-06"
    },
    "Fuel Permit": {
      "feeCents": 1500,
      "feeText": "$15",
      "duration": "10 days",
      "status": "fixed",
      "source": "https://dmv.ny.gov/forms/irp8.pdf",
      "researchDate": "2026-11-06"
    }
  },
  "South Dakota": {
    "Trip Permit": {
      "feeCents": 1500,
      "feeText": "$15",
      "duration": "72 hours",
      "status": "fixed",
      "source": "https://dor.sd.gov/media/t0ghq1bu/2025-south-dakota-irp-manual.pdf",
      "researchDate": "2026-11-06"
    },
    "Fuel Permit": {
      "feeCents": 2000,
      "feeText": "$20",
      "duration": "72 hours or state exit",
      "status": "fixed",
      "source": "https://dor.sd.gov/media/nfihkqgc/2025-ifta-manual.pdf",
      "researchDate": "2026-11-06"
    }
  },
  "Tennessee": {
    "Trip Permit": {
      "feeCents": 3000,
      "feeText": "$30 (+ wire-service fee)",
      "duration": "72 hours",
      "status": "fixed",
      "source": "https://www.tn.gov/safety/tnhp/cvemain/temporary-fuel-use-permits.html",
      "orderingNote": "Approved permit provider / Comdata option",
      "researchDate": "2026-11-06"
    },
    "Fuel Permit": {
      "feeCents": 3000,
      "feeText": "$30 (+ wire-service fee)",
      "duration": "Up to 7 days",
      "status": "fixed",
      "source": "https://www.tn.gov/safety/tnhp/cvemain/temporary-fuel-use-permits.html",
      "orderingNote": "Approved permit provider / Comdata option",
      "researchDate": "2026-11-06"
    }
  },
  "Texas": {
    "Trip Permit": {
      "feeText": "$25 / $50 (+$4.75 processing)",
      "duration": "72 / 144 hours",
      "status": "conditional",
      "source": "https://www.txdmv.gov/motorists/register-your-vehicle/temporary-registration",
      "researchDate": "2026-11-06"
    },
    "Fuel Permit": {
      "feeCents": 5000,
      "feeText": "$50",
      "duration": "20 days / 1 entry",
      "status": "fixed",
      "source": "https://comptroller.texas.gov/taxes/fuels/trip-permits.php",
      "researchDate": "2026-11-06"
    }
  },
  "Utah": {
    "Trip Permit": {
      "feeCents": 2500,
      "feeText": "$25",
      "duration": "96 hours",
      "status": "fixed",
      "source": "https://dmv.ny.gov/forms/irp8.pdf",
      "researchDate": "2026-11-06"
    },
    "Fuel Permit": {
      "feeCents": 2500,
      "feeText": "$25",
      "duration": "96 hours",
      "status": "fixed",
      "source": "https://le.utah.gov/xcode/Title59/Chapter13/C59-13-S303_1800010118000101.pdf",
      "researchDate": "2026-11-06"
    }
  },
  "Vermont": {
    "Trip Permit": {
      "feeCents": 2000,
      "feeText": "$20 (IRP/IFTA listing)",
      "duration": "72 hours",
      "status": "fixed",
      "source": "https://dmv.vermont.gov/CVO/fees",
      "researchDate": "2026-11-06"
    },
    "Fuel Permit": {
      "feeText": "$15 (fuel statute; coverage verify)",
      "duration": "72 hours",
      "status": "conditional",
      "source": "https://legislature.vermont.gov/statutes/section/23/027/03010",
      "researchDate": "2026-11-06"
    }
  },
  "Virginia": {
    "Trip Permit": {
      "feeCents": 1500,
      "feeText": "$15",
      "duration": "10 days",
      "status": "fixed",
      "source": "https://www.dmv.virginia.gov/businesses/motor-carriers/trip-permits/fee-con-forms",
      "researchDate": "2026-11-06"
    },
    "Fuel Permit": {
      "feeCents": 2000,
      "feeText": "$20",
      "duration": "10 days",
      "status": "fixed",
      "source": "https://www.dmv.virginia.gov/businesses/motor-carriers/trip-permits/fee-con-forms",
      "researchDate": "2026-11-06"
    },
    "Trip + Fuel Permit": {
      "feeCents": 3500,
      "feeText": "$35 state trip+fuel combination",
      "status": "fixed",
      "duration": "10 days",
      "source": "https://www.dmv.virginia.gov/businesses/motor-carriers/trip-permits/fee-con-forms",
      "researchDate": "2026-11-06",
      "orderingNote": "Confirm state issues one combination permit; service-count and final fees must be verified."
    }
  },
  "Washington": {
    "Trip Permit": {
      "feeCents": 2500,
      "feeText": "$25 (+$11 service fee)",
      "duration": "3 days",
      "status": "fixed",
      "source": "https://dol.wa.gov/media/pdf/1611/irpmanualpdf",
      "researchDate": "2026-11-06"
    },
    "Fuel Permit": {
      "feeCents": 3300,
      "feeText": "$33",
      "duration": "3 days",
      "status": "fixed",
      "source": "https://dol.wa.gov/media/pdf/1611/irpmanualpdf",
      "researchDate": "2026-11-06"
    }
  },
  "West Virginia": {
    "Trip Permit": {
      "feeText": "$34 (trip + fuel combo)",
      "duration": "10 days",
      "status": "conditional",
      "source": "https://dmv.ny.gov/forms/irp8.pdf",
      "researchDate": "2026-11-06"
    },
    "Fuel Permit": {
      "feeText": "Included in $34 combo",
      "duration": "10 days",
      "status": "conditional",
      "source": "https://dmv.ny.gov/forms/irp8.pdf",
      "researchDate": "2026-11-06"
    },
    "Trip + Fuel Permit": {
      "feeCents": 3400,
      "feeText": "$34 state trip+fuel combination",
      "status": "fixed",
      "duration": "10 days",
      "source": "https://dmv.ny.gov/forms/irp8.pdf",
      "researchDate": "2026-11-06",
      "orderingNote": "Confirm state issues one combination permit; service-count and final fees must be verified."
    }
  },
  "Wisconsin": {
    "Trip Permit": {
      "feeCents": 1500,
      "feeText": "$15",
      "duration": "72 hours",
      "status": "fixed",
      "source": "https://wisconsindot.gov/Pages/dmv/com-drv-vehs/mtr-car-trkr/trip-permits.aspx",
      "researchDate": "2026-11-06"
    },
    "Fuel Permit": {
      "feeCents": 1500,
      "feeText": "$15",
      "duration": "72 hours",
      "status": "fixed",
      "source": "https://wisconsindot.gov/Pages/dmv/com-drv-vehs/mtr-car-trkr/trip-permits.aspx",
      "researchDate": "2026-11-06"
    }
  },
  "Wyoming": {
    "Trip Permit": {
      "feeCents": 2000,
      "feeText": "$20 single / $40 combination",
      "duration": "96 hours",
      "status": "fixed",
      "source": "https://www.dot.state.wy.us/home/trucking_commercial_vehicles/commercial_permits/trip_permits.html",
      "researchDate": "2026-11-06"
    },
    "Fuel Permit": {
      "feeCents": 750,
      "feeText": "$7.50 single / $15 combination",
      "duration": "96 hours",
      "status": "fixed",
      "source": "https://www.dot.state.wy.us/home/trucking_commercial_vehicles/commercial_permits/trip_permits.html",
      "researchDate": "2026-11-06"
    }
  }
};
export function feeReference(state,permitType) {
  return permitFeeReferences[state]?.[permitType] || null;
}
