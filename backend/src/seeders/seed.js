const bcrypt = require('bcrypt');
const { sequelize, User, Route, Stop, RouteStop, Bus, Schedule, Driver, Assignment, Alert, BusTracking } = require('../models');

// Bus For All — Real Seed Data
// 10 Routes, 175 unique stops, 213 route-stop rows, 51 buses
// Schedule: daily 05:30–20:30, every 20 minutes

const ROUTES = [
  { id: 1, name: 'Route 01', description: 'Prek Pnov Bridge ↔ Chbar Ampov' },
  { id: 2, name: 'Route 02', description: 'Old Stadium Roundabout ↔ Ta Khmao' },
  { id: 3, name: 'Route 03', description: 'Russey Keo Bridge ↔ Street 2004' },
  { id: 4, name: 'Route 04', description: 'Prek Pnov Bridge ↔ Veal Sbov' },
  { id: 5, name: 'Route 05', description: 'Phnom Penh City Bus Depot ↔ Old Stadium' },
  { id: 6, name: 'Route 06', description: 'Old Stadium Roundabout ↔ Techo International Airport (KTI)' },
  { id: 7, name: 'Route 07', description: 'Street 2004 ↔ Veal Sbov Bus Station' },
  { id: 8, name: 'Route 08', description: 'Win-Win Boulevard ↔ Chak Angre Leu Bus Station' },
  { id: 9, name: 'Route 09', description: 'Russey Keo Bridge ↔ Punhea Krek Primary School' },
  { id: 10, name: 'Route 10', description: 'Borey Sonthipheap 2 ↔ Russey Keo Garden Bus Station' }
];

const STOPS = [
  { id: 1, name: 'Prek Pnov Bridge', latitude: 11.6626852, longitude: 104.8741432 },
  { id: 2, name: 'Forestry Administration (Prek Pnov)', latitude: 11.6544529, longitude: 104.8668154 },
  { id: 3, name: 'Chea Sim Chamroeunroth Secondary School', latitude: 11.6440156, longitude: 104.8758205 },
  { id: 4, name: 'Islam Mosque (KM 9)', latitude: 11.6375239, longitude: 104.8862114 },
  { id: 5, name: 'Techo Hun Sen Chrang Chamres Primary School', latitude: 11.6338601, longitude: 104.8972839 },
  { id: 6, name: 'Borey Piphub Thmey Russey Keo', latitude: 11.6261064, longitude: 104.9066887 },
  { id: 7, name: 'CTN Television Station', latitude: 11.6162944, longitude: 104.9146673 },
  { id: 8, name: 'Russey Keo Bridge', latitude: 11.608797, longitude: 104.9177384 },
  { id: 9, name: 'Russey Keo Commune Office', latitude: 11.5979557, longitude: 104.9184509 },
  { id: 10, name: 'Old Stadium Roundabout', latitude: 11.5847003, longitude: 104.9160044 },
  { id: 11, name: 'Vattanac Capital', latitude: 11.5733191, longitude: 104.9178585 },
  { id: 12, name: 'Wat Koh', latitude: 11.5638067, longitude: 104.9192435 },
  { id: 13, name: 'Preah Yukanthor High School', latitude: 11.5566121, longitude: 104.9203449 },
  { id: 14, name: 'Bokor Traffic Light (Boeung Keng Kang)', latitude: 11.5475055, longitude: 104.9216709 },
  { id: 15, name: 'Royal University of Law and Economics (RULE)', latitude: 11.5365114, longitude: 104.9233825 },
  { id: 16, name: 'Monivong Bridge', latitude: 11.5301939, longitude: 104.9303354 },
  { id: 17, name: 'Chbar Ampov Market', latitude: 11.5317928, longitude: 104.9370151 },
  { id: 18, name: 'Wat Niroth Raingsey', latitude: 11.5306085, longitude: 104.9457736 },
  { id: 19, name: 'Cho Ray Phnom Penh Hospital', latitude: 11.536339, longitude: 104.9596386 },
  { id: 20, name: 'Veal Sbov Bus Terminal', latitude: 11.5340362, longitude: 104.9769093 },
  { id: 21, name: 'Wat Phnom', latitude: 11.577837, longitude: 104.9218268 },
  { id: 22, name: 'Preah Sisowat High School', latitude: 11.5644292, longitude: 104.9257763 },
  { id: 23, name: 'Independence Monument', latitude: 11.5570897, longitude: 104.9278353 },
  { id: 24, name: 'Bulgaria Embassy', latitude: 11.5504117, longitude: 104.9284676 },
  { id: 25, name: 'Nou Mony Ream Pagoda (Wat Thann)', latitude: 11.5452938, longitude: 104.9279057 },
  { id: 26, name: 'Ministry of Interior Cambodia', latitude: 11.5365499, longitude: 104.9284958 },
  { id: 27, name: 'Ministry of Culture and Fine Arts', latitude: 11.5327333, longitude: 104.9299217 },
  { id: 28, name: 'Kbal Tnol Market', latitude: 11.5285635, longitude: 104.9314995 },
  { id: 29, name: 'Chak Angre Leu Bus Station', latitude: 11.5165799, longitude: 104.9353003 },
  { id: 30, name: 'Wat Chak Angre Krom', latitude: 11.512604, longitude: 104.9357216 },
  { id: 31, name: 'Preah Noreay Roundabout', latitude: 11.4919146, longitude: 104.9433616 },
  { id: 32, name: 'Ta Khmao New Market', latitude: 11.4884089, longitude: 104.9418428 },
  { id: 33, name: 'Ta Khmao Roundabout', latitude: 11.4818873, longitude: 104.9444864 },
  { id: 34, name: 'R.C.A.F Stadium (Old Stadium)', latitude: 11.5852875, longitude: 104.9142851 },
  { id: 35, name: 'Toul Kork TVK Station', latitude: 11.585524, longitude: 104.901449 },
  { id: 36, name: 'Camko City Traffic Light', latitude: 11.5899678, longitude: 104.8978961 },
  { id: 37, name: 'Borey Peng Houth The Star Emerald', latitude: 11.5906714, longitude: 104.8886257 },
  { id: 38, name: 'Chip Mong Sen Sok Mall', latitude: 11.5899406, longitude: 104.8739296 },
  { id: 39, name: 'Boeung Baitong Market', latitude: 11.5893106, longitude: 104.862839 },
  { id: 40, name: 'Street Oknha Try Heng (St. 2011)', latitude: 11.5873393, longitude: 104.8532206 },
  { id: 41, name: 'Chhouk Meas Wedding Hall II', latitude: 11.5837071, longitude: 104.853295 },
  { id: 42, name: 'Borey New World Chhuk Meas Market', latitude: 11.5742249, longitude: 104.8537694 },
  { id: 43, name: 'Bunrany Hun Sen Samki Sen Sok Primary School', latitude: 11.5671758, longitude: 104.8533829 },
  { id: 44, name: 'Century Plaza', latitude: 11.5606429, longitude: 104.8537973 },
  { id: 45, name: 'Street 2004 Bus Station', latitude: 11.552808, longitude: 104.857438 },
  { id: 46, name: 'Borey Lim Chheanghak (Grand Phnom Penh)', latitude: 11.6510191, longitude: 104.8594574 },
  { id: 47, name: 'Borey Premier Angkor Phnom Penh', latitude: 11.6401969, longitude: 104.866172 },
  { id: 48, name: 'CIA First International School (Grand Phnom Penh)', latitude: 11.6347677, longitude: 104.8695314 },
  { id: 49, name: 'Ministry of Land Management Urban Planning and Construction', latitude: 11.6298232, longitude: 104.8725402 },
  { id: 50, name: 'Borey Vimean Phnom Penh (Russey Keo)', latitude: 11.6336594, longitude: 104.8817968 },
  { id: 51, name: 'Chip Mong Mall 598', latitude: 11.6284626, longitude: 104.8858232 },
  { id: 52, name: 'Ministry of Public Work and Transport', latitude: 11.6224014, longitude: 104.8900091 },
  { id: 53, name: 'Chea Sophara Traffic Light', latitude: 11.6063851, longitude: 104.8984235 },
  { id: 54, name: 'Borey Sen Sok (Sen Sok Town)', latitude: 11.5578761, longitude: 104.9084268 },
  { id: 55, name: 'Borey Sun Way Street 337', latitude: 11.5823862, longitude: 104.8880932 },
  { id: 56, name: 'Royal University of Phnom Penh (RUPP)', latitude: 11.5679549, longitude: 104.8880558 },
  { id: 57, name: 'Cambodian Friendship Hospital (China Preah Kosomak)', latitude: 11.5648503, longitude: 104.8886563 },
  { id: 58, name: 'Cambodian Mekong University', latitude: 11.5573578, longitude: 104.8871106 },
  { id: 59, name: 'Chea Sim Samaki Highschool', latitude: 11.5494863, longitude: 104.8916171 },
  { id: 60, name: 'Stueng Mean Chey Flyover Bridge', latitude: 11.5495711, longitude: 104.8954761 },
  { id: 61, name: 'Khmer-Soviet Friendship Hospital', latitude: 11.5434779, longitude: 104.9048068 },
  { id: 62, name: 'Ouknha Morha Pheakdey Toul Tumpong Primary School', latitude: 11.5373117, longitude: 104.9106296 },
  { id: 63, name: 'Chip Mong 271 Mega Mall', latitude: 11.5266288, longitude: 104.9214148 },
  { id: 64, name: 'Boeng Trabek Water Station', latitude: 11.5283142, longitude: 104.9252209 },
  { id: 65, name: 'Phnom Penh City Bus Depot', latitude: 11.6691203, longitude: 104.8690098 },
  { id: 66, name: 'Roundabout Win-Win Boulevard', latitude: 11.6664213, longitude: 104.8780389 },
  { id: 67, name: 'Morodok Decho Stadium Roundabout', latitude: 11.6752629, longitude: 104.8820153 },
  { id: 68, name: 'Morodok Decho Stadium', latitude: 11.6851984, longitude: 104.8884146 },
  { id: 69, name: 'Safari Zoo', latitude: 11.6998449, longitude: 104.8739027 },
  { id: 70, name: 'Royal Academy Of Justice Of Cambodia', latitude: 11.6896495, longitude: 104.8957031 },
  { id: 71, name: 'Borey Premier Park Project', latitude: 11.6857847, longitude: 104.9105876 },
  { id: 72, name: 'Makro Market', latitude: 11.6818094, longitude: 104.9184808 },
  { id: 73, name: 'Bak Kheng Koh Dach Ferry Interminal', latitude: 11.6763249, longitude: 104.9179546 },
  { id: 74, name: 'Bak Kheng Primary School', latitude: 11.6701041, longitude: 104.915549 },
  { id: 75, name: 'Koh Dach Ferry Terminal', latitude: 11.6522507, longitude: 104.9146845 },
  { id: 76, name: 'Pohtiprek Pagoda (Kthor Pagoda)', latitude: 11.6438573, longitude: 104.9177667 },
  { id: 77, name: 'Prek Leap National Institute Of Agriculture', latitude: 11.6404896, longitude: 104.9193774 },
  { id: 78, name: 'Vearin Prek Leap Pagoda', latitude: 11.6305576, longitude: 104.9233883 },
  { id: 79, name: 'Forthing Car Sales Company', latitude: 11.6124045, longitude: 104.9276087 },
  { id: 80, name: 'Asia Pacific Fredfort International School', latitude: 11.6049189, longitude: 104.9293278 },
  { id: 81, name: 'Caltex Chroy Changvar', latitude: 11.6006821, longitude: 104.9300555 },
  { id: 82, name: 'JVC Technical Institute', latitude: 11.5910646, longitude: 104.9293185 },
  { id: 83, name: 'Norton University', latitude: 11.588492, longitude: 104.9304341 },
  { id: 84, name: 'Svay Chrum Ferry', latitude: 11.5886061, longitude: 104.9373226 },
  { id: 85, name: 'Lavita One', latitude: 11.5803095, longitude: 104.9389901 },
  { id: 86, name: 'Kbal Chrouy Sakura Elementary School', latitude: 11.5722722, longitude: 104.937414 },
  { id: 87, name: 'Sokha Hotel', latitude: 11.5702723, longitude: 104.9361098 },
  { id: 88, name: 'Chroy Changva Primary School', latitude: 11.5833751, longitude: 104.9283253 },
  { id: 89, name: 'Chea Sim Chroy Changvar High School', latitude: 11.5864897, longitude: 104.9275842 },
  { id: 90, name: 'Embassy of France in Cambodia', latitude: 11.583825, longitude: 104.9161611 },
  { id: 91, name: 'Calmette Hospital', latitude: 11.5815303, longitude: 104.9165793 },
  { id: 92, name: 'ACLEDA Bank Plc. Headquarters', latitude: 11.5772908, longitude: 104.9172299 },
  { id: 93, name: 'Government Office', latitude: 11.5746821, longitude: 104.917643 },
  { id: 94, name: 'Anti-Corruption Unit (ACU)', latitude: 11.5635064, longitude: 104.9195554 },
  { id: 95, name: 'Embassy of Germany', latitude: 11.559441, longitude: 104.9198888 },
  { id: 96, name: 'Boeung Keng Kang 2 Administrative Police Post', latitude: 11.5528745, longitude: 104.9209184 },
  { id: 97, name: 'Agribank Cambodia Branch', latitude: 11.551184, longitude: 104.9211627 },
  { id: 98, name: 'The Embassy of Vietnam', latitude: 11.5405605, longitude: 104.9230375 },
  { id: 99, name: 'Cambodia National Council for Children', latitude: 11.5376999, longitude: 104.9232121 },
  { id: 100, name: 'Boeng Trabaek High School', latitude: 11.5342918, longitude: 104.9239781 },
  { id: 101, name: 'Department of Agricultural Hydraulics', latitude: 11.5306632, longitude: 104.9258769 },
  { id: 102, name: 'Every Nation Campus Mean Chey', latitude: 11.5212068, longitude: 104.9272489 },
  { id: 103, name: 'MPL Cambodia Arena', latitude: 11.5041048, longitude: 104.9264699 },
  { id: 104, name: 'Borey Angkor Palace (60M)', latitude: 11.4964337, longitude: 104.9247993 },
  { id: 105, name: 'Aeon Mall Mean Chey', latitude: 11.4837417, longitude: 104.919577 },
  { id: 106, name: 'Chip Mong Land Landmark 60M', latitude: 11.4751721, longitude: 104.9175675 },
  { id: 107, name: 'Golden Gate American School (Mean Chey Campus)', latitude: 11.4622394, longitude: 104.9185974 },
  { id: 108, name: 'Cambana ST.60m', latitude: 11.4503116, longitude: 104.9231625 },
  { id: 109, name: 'TIA CITY', latitude: 11.4170661, longitude: 104.9310359 },
  { id: 110, name: 'Techo International Airport (KTI)', latitude: 11.3626424, longitude: 104.9378576 },
  { id: 111, name: 'CCC Cambodia Sport Club', latitude: 11.5508486, longitude: 104.8665832 },
  { id: 112, name: 'CIS International School', latitude: 11.5519543, longitude: 104.8762975 },
  { id: 113, name: 'CLA Language Center', latitude: 11.5497363, longitude: 104.8854402 },
  { id: 114, name: 'American International School', latitude: 11.5463921, longitude: 104.8839774 },
  { id: 115, name: 'Television Channel Bayon', latitude: 11.5351138, longitude: 104.8833679 },
  { id: 116, name: 'Gendarmerie Royale De Pnhom Penh', latitude: 11.5345456, longitude: 104.8850428 },
  { id: 117, name: 'Phum Reasey Primary School', latitude: 11.5280156, longitude: 104.8877041 },
  { id: 118, name: 'Vattanac Bank (371)', latitude: 11.5221116, longitude: 104.9008347 },
  { id: 119, name: 'PC Market', latitude: 11.5191153, longitude: 104.9172651 },
  { id: 120, name: 'Win-Win Boulevard Bus Stop', latitude: 11.6689723, longitude: 104.8693884 },
  { id: 121, name: 'Prek Pnov Roundabout', latitude: 11.6660269, longitude: 104.877742 },
  { id: 122, name: 'Paragon International School', latitude: 11.6397022, longitude: 104.8662459 },
  { id: 123, name: 'Borey Angkor Camko City', latitude: 11.612795, longitude: 104.8832432 },
  { id: 124, name: 'Australia International School', latitude: 11.6055679, longitude: 104.8877682 },
  { id: 125, name: 'Toul Kork Kindergarten School', latitude: 11.5831133, longitude: 104.9005615 },
  { id: 126, name: 'Institute of Technology of Cambodia', latitude: 11.5710097, longitude: 104.8994034 },
  { id: 127, name: 'Sonthor Mok Primary School', latitude: 11.5660187, longitude: 104.9002367 },
  { id: 128, name: 'Old Derm Kor Market', latitude: 11.5533032, longitude: 104.90177 },
  { id: 129, name: 'City Mall', latitude: 11.5578761, longitude: 104.9084268 },
  { id: 130, name: 'Vanda Institute', latitude: 11.5467901, longitude: 104.9077813 },
  { id: 131, name: 'Ministry of Agriculture Forestry and Fisheries', latitude: 11.5440434, longitude: 104.9242637 },
  { id: 132, name: "Kantha Bopha IV Children's Hospital", latitude: 11.5779513, longitude: 104.9217213 },
  { id: 133, name: 'Preah Norodom Primary School', latitude: 11.5683949, longitude: 104.9249126 },
  { id: 134, name: 'Preah Sisowath High School', latitude: 11.5618792, longitude: 104.9267958 },
  { id: 135, name: 'IOM Mission in Cambodia', latitude: 11.5607502, longitude: 104.9234639 },
  { id: 136, name: 'Monivong Road 214 Bus Stop 36', latitude: 11.5603783, longitude: 104.9200649 },
  { id: 137, name: 'Capitol Bus Stop', latitude: 11.5621444, longitude: 104.9183113 },
  { id: 138, name: 'Olympia Mall', latitude: 11.5620062, longitude: 104.9143829 },
  { id: 139, name: 'Woori Bank', latitude: 11.5630978, longitude: 104.9070326 },
  { id: 140, name: 'Santhormok Primary School', latitude: 11.5663078, longitude: 104.9003182 },
  { id: 141, name: 'Institute of Technology Bus Stop', latitude: 11.571073, longitude: 104.8994755 },
  { id: 142, name: 'National Institute of Public Health', latitude: 11.5767426, longitude: 104.8989658 },
  { id: 143, name: 'Paragon International University', latitude: 11.5792597, longitude: 104.8939577 },
  { id: 144, name: 'Western International School (Sunway)', latitude: 11.5830637, longitude: 104.8907685 },
  { id: 145, name: 'Borey Sunway', latitude: 11.5823862, longitude: 104.8880932 },
  { id: 146, name: 'Borey Peng Hout De Star Lai', latitude: 11.5808955, longitude: 104.8862682 },
  { id: 147, name: 'ZANDO Sen Sok', latitude: 11.5851849, longitude: 104.8819953 },
  { id: 148, name: 'Markro Cambodia', latitude: 11.5912169, longitude: 104.8817775 },
  { id: 149, name: 'Borey Piphub Thmey Aeno Mall Sen Sok', latitude: 11.5979113, longitude: 104.8830552 },
  { id: 150, name: 'New Khlaingromsave Market', latitude: 11.5981294, longitude: 104.8737964 },
  { id: 151, name: 'Daily Furniture Hanoi Blvd', latitude: 11.604955, longitude: 104.869845 },
  { id: 152, name: 'Toul Prasat Sen Sok High School', latitude: 11.6233186, longitude: 104.8568344 },
  { id: 153, name: 'BELTEI International School Campus 27', latitude: 11.6492847, longitude: 104.8560536 },
  { id: 154, name: 'Chrang Chamreh Primary School', latitude: 11.6338249, longitude: 104.8973615 },
  { id: 155, name: 'Salar Khan Russey Keo', latitude: 11.628614, longitude: 104.9047093 },
  { id: 156, name: 'Samdech Euv-Samdech Mae Hospital', latitude: 11.6194502, longitude: 104.9128812 },
  { id: 157, name: 'Sokimix Garden Bus Stop', latitude: 11.6082448, longitude: 104.9176368 },
  { id: 158, name: 'Punhea Krek Primary School', latitude: 11.5916802, longitude: 104.9181777 },
  { id: 159, name: 'Borey Sonthipeap 2', latitude: 11.5020586, longitude: 104.8356691 },
  { id: 160, name: 'Preah Thom Trai Pagoda', latitude: 11.5022034, longitude: 104.8574439 },
  { id: 161, name: 'Kom Peng Pagoda', latitude: 11.5088519, longitude: 104.8592142 },
  { id: 162, name: 'Toul Pongro Market', latitude: 11.5162545, longitude: 104.8592096 },
  { id: 163, name: 'Toun Fa University', latitude: 11.525917, longitude: 104.8583432 },
  { id: 164, name: 'Canadia Industrial Park Market', latitude: 11.5316963, longitude: 104.8650507 },
  { id: 165, name: 'Phsar Ekreach III', latitude: 11.533335, longitude: 104.8775666 },
  { id: 166, name: 'Gendarmerie Royale De Phnom Penh', latitude: 11.5345456, longitude: 104.8850428 },
  { id: 167, name: 'Old Steung Mean Chey Market', latitude: 11.5434904, longitude: 104.8939651 },
  { id: 168, name: 'Steung Meanchey Primary School', latitude: 11.5453541, longitude: 104.8958673 },
  { id: 169, name: 'Phnom Penh Soriya Bus Stop', latitude: 11.5527674, longitude: 104.9036544 },
  { id: 170, name: 'Orussey Market', latitude: 11.5639336, longitude: 104.914618 },
  { id: 171, name: 'Soriya Cinema', latitude: 11.5679618, longitude: 104.9203139 },
  { id: 172, name: 'Preah Ang Duong Hospital', latitude: 11.5718331, longitude: 104.9236522 },
  { id: 173, name: 'Hun Sen Bun Rany Wat Phnom High School', latitude: 11.585545, longitude: 104.9182151 },
  { id: 174, name: 'Chaktomuk Referral Hospital', latitude: 11.5877095, longitude: 104.9188408 },
  { id: 175, name: 'Russey Keo Garden Bus Station', latitude: 11.605117, longitude: 104.9187063 }
];

const ROUTE_STOPS = {
  1: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
  2: [10, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33],
  3: [8, 9, 34, 35, 18, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45],
  4: [1, 46, 47, 48, 49, 50, 51, 52, 53, 36, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 16, 17, 18, 19, 20],
  5: [65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 10],
  6: [10, 91, 92, 93, 11, 94, 95, 96, 97, 14, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110],
  7: [45, 111, 112, 113, 114, 115, 116, 117, 118, 119, 63, 64, 16, 17, 18, 19, 20],
  8: [120, 121, 1, 122, 50, 123, 124, 36, 125, 126, 127, 128, 129, 130, 14, 131, 26, 27, 28, 29],
  9: [8, 9, 10, 132, 133, 134, 135, 136, 137, 138, 139, 140, 141, 142, 143, 144, 145, 146, 147, 148, 149, 150, 151, 152, 153, 154, 155, 156, 157, 158],
  10: [159, 160, 161, 162, 163, 164, 165, 166, 167, 168, 169, 129, 170, 171, 172, 132, 10, 173, 174, 158, 175]
};

const BUSES = [
  ['PP-01-001', 'PP-01-002', 'PP-01-003', 'PP-01-004', 'PP-01-005'],
  ['PP-02-001', 'PP-02-002', 'PP-02-003', 'PP-02-004'],
  ['PP-03-001', 'PP-03-002', 'PP-03-003', 'PP-03-004'],
  ['PP-04-001', 'PP-04-002', 'PP-04-003', 'PP-04-004', 'PP-04-005', 'PP-04-006'],
  ['PP-05-001', 'PP-05-002', 'PP-05-003', 'PP-05-004', 'PP-05-005', 'PP-05-006'],
  ['PP-06-001', 'PP-06-002', 'PP-06-003', 'PP-06-004', 'PP-06-005'],
  ['PP-07-001', 'PP-07-002', 'PP-07-003', 'PP-07-004'],
  ['PP-08-001', 'PP-08-002', 'PP-08-003', 'PP-08-004', 'PP-08-005'],
  ['PP-09-001', 'PP-09-002', 'PP-09-003', 'PP-09-004', 'PP-09-005', 'PP-09-006', 'PP-09-007'],
  ['PP-10-001', 'PP-10-002', 'PP-10-003', 'PP-10-004', 'PP-10-005']
].flat();

const TRACKING_PROGRESS = [0.3, 0.5, 0.2, 0.7, 0.4, 0.1, 0.6, 0.8, 0.3, 0.5];

const SCHEDULE_START_MIN = 5 * 60 + 30; // 05:30
const SCHEDULE_END_MIN = 20 * 60 + 30; // 20:30
const SCHEDULE_INTERVAL_MIN = 20;
const STOP_GAP_MIN = 2;
const ALL_DAYS = 'Mon,Tue,Wed,Thu,Fri,Sat,Sun';

function minutesToTime(totalMinutes) {
  const h = String(Math.floor(totalMinutes / 60) % 24).padStart(2, '0');
  const m = String(totalMinutes % 60).padStart(2, '0');
  return `${h}:${m}:00`;
}

async function seed() {
  await sequelize.authenticate();
  await sequelize.sync({ force: true }); // WARNING: drops and recreates all tables

  console.log('🌱 Seeding database...');

  // Users
  const hash = (pw) => bcrypt.hash(pw, 10);
  const admin = await User.create({ name: 'Admin', email: 'admin@busforall.com', passwordHash: await hash('admin123'), role: 'admin' });
  const commuter1 = await User.create({ name: 'Sophea Chan', email: 'sophea@example.com', passwordHash: await hash('password123'), role: 'commuter' });
  const commuter2 = await User.create({ name: 'Dara Kim', email: 'dara@example.com', passwordHash: await hash('password123'), role: 'commuter' });
  const driverUser1 = await User.create({ name: 'Bunna Sok', email: 'bunna@busforall.com', passwordHash: await hash('driver123'), role: 'driver' });
  const driverUser2 = await User.create({ name: 'Ratha Lim', email: 'ratha@busforall.com', passwordHash: await hash('driver123'), role: 'driver' });

  // Drivers
  const driver1 = await Driver.create({ userId: driverUser1.id, licenseNumber: 'PP-DRV-001' });
  const driver2 = await Driver.create({ userId: driverUser2.id, licenseNumber: 'PP-DRV-002' });

  // Routes
  await Route.bulkCreate(ROUTES);

  // Stops
  await Stop.bulkCreate(STOPS);

  // Route stops
  const routeStops = Object.entries(ROUTE_STOPS).flatMap(([routeId, stopIds]) =>
    stopIds.map((stopId, i) => ({ routeId: Number(routeId), stopId, stopOrder: i + 1 }))
  );
  await RouteStop.bulkCreate(routeStops);

  // Buses
  const buses = await Bus.bulkCreate(BUSES.map((plateNumber) => ({ plateNumber, capacity: 45, status: 'active' })));

  // Bus tracking — first bus of each route's group, live and running
  const busGroupSizes = [5, 4, 4, 6, 6, 5, 4, 5, 7, 5];
  let offset = 0;
  const trackingRows = ROUTES.map((route, i) => {
    const busId = buses[offset].id;
    offset += busGroupSizes[i];
    return {
      routeId: route.id,
      busId,
      progress: TRACKING_PROGRESS[i],
      isRunning: true,
      lastUpdated: new Date()
    };
  });
  await BusTracking.bulkCreate(trackingRows);

  // Schedules — every 20 minutes from 05:30 to 20:30, arrival based on stop count
  const maxStopOrderByRoute = {};
  for (const rs of routeStops) {
    maxStopOrderByRoute[rs.routeId] = Math.max(maxStopOrderByRoute[rs.routeId] || 0, rs.stopOrder);
  }

  const schedules = [];
  for (const route of ROUTES) {
    const travelMinutes = (maxStopOrderByRoute[route.id] - 1) * STOP_GAP_MIN;
    for (let depMin = SCHEDULE_START_MIN; depMin <= SCHEDULE_END_MIN; depMin += SCHEDULE_INTERVAL_MIN) {
      schedules.push({
        routeId: route.id,
        departureTime: minutesToTime(depMin),
        arrivalTime: minutesToTime(depMin + travelMinutes),
        days: ALL_DAYS
      });
    }
  }
  await Schedule.bulkCreate(schedules);

  // Sample assignments for today
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  await Assignment.create({ driverId: driver1.id, busId: buses[0].id, routeId: ROUTES[0].id, assignmentDate: today });
  await Assignment.create({ driverId: driver2.id, busId: buses[5].id, routeId: ROUTES[1].id, assignmentDate: today });

  // Sample alert
  await Alert.create({ title: 'Service Notice', message: 'All routes operating normally. Please check schedules for weekend services.', type: 'general', isActive: true });

  console.log(`✅ Seed complete! ${ROUTES.length} routes, ${STOPS.length} stops, ${routeStops.length} route-stops, ${buses.length} buses, ${schedules.length} schedules`);
  console.log('   Admin:    admin@busforall.com  / admin123');
  console.log('   Commuter: sophea@example.com   / password123');
  console.log('   Driver:   bunna@busforall.com  / driver123');

  await sequelize.close();
}

seed().catch((err) => { console.error('❌ Seed failed:', err); process.exit(1); });
