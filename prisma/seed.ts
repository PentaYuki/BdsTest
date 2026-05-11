import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const now = new Date();
const currentYear = now.getFullYear();
const currentMonth = now.getMonth(); // 0-indexed
const period = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;

function daysAgo(n: number): Date {
  const d = new Date(now);
  d.setDate(d.getDate() - n);
  return d;
}

function daysFromNow(n: number): Date {
  const d = new Date(now);
  d.setDate(d.getDate() + n);
  return d;
}

async function main() {
  console.log('Seeding database...');

  // Clean up existing data
  await prisma.kPITarget.deleteMany();
  await prisma.dealDoc.deleteMany();
  await prisma.propertyDoc.deleteMany();
  await prisma.campaign.deleteMany();
  await prisma.taskDeal.deleteMany();
  await prisma.taskOwner.deleteMany();
  await prisma.taskCustomer.deleteMany();
  await prisma.task.deleteMany();
  await prisma.dealCustomer.deleteMany();
  await prisma.dealProperty.deleteMany();
  await prisma.deal.deleteMany();
  await prisma.propertyView.deleteMany();
  await prisma.priceHistory.deleteMany();
  await prisma.interaction.deleteMany();
  await prisma.property.deleteMany();
  await prisma.owner.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.user.deleteMany();

  // ==================== USERS ====================
  const admin = await prisma.user.create({
    data: {
      email: 'lehoangde@derealty360.com',
      name: 'Lê Hoàng Đệ',
      phone: '0901234567',
      password: '$2a$10$dummyhashedpassword1234',
      role: 'admin',
      active: true,
    },
  });

  const sales1 = await prisma.user.create({
    data: {
      email: 'nguyenthanhson@derealty360.com',
      name: 'Nguyễn Thành Sơn',
      phone: '0902345678',
      password: '$2a$10$dummyhashedpassword1234',
      role: 'sales',
      active: true,
    },
  });

  const sales2 = await prisma.user.create({
    data: {
      email: 'tranthimai@derealty360.com',
      name: 'Trần Thị Mai',
      phone: '0903456789',
      password: '$2a$10$dummyhashedpassword1234',
      role: 'sales',
      active: true,
    },
  });

  const assistant = await prisma.user.create({
    data: {
      email: 'phamthingoc@derealty360.com',
      name: 'Phạm Thị Ngọc',
      phone: '0904567890',
      password: '$2a$10$dummyhashedpassword1234',
      role: 'assistant',
      active: true,
    },
  });

  const marketing = await prisma.user.create({
    data: {
      email: 'vovanhtuan@derealty360.com',
      name: 'Võ Văn Tuấn',
      phone: '0905678901',
      password: '$2a$10$dummyhashedpassword1234',
      role: 'marketing',
      active: true,
    },
  });

  console.log('Created 5 users');

  // ==================== CUSTOMERS ====================
  const customerData = [
    { name: 'Trần Văn Hùng', phone: '0912345001', email: 'hung.tv@email.com', type: 'buy', demand: 'buy', propertyType: 'apartment', areaInterest: 'Quận 7', budget: '2-3 tỷ', timeframe: '1-3 tháng', heatLevel: 'hot', source: 'facebook', status: 'negotiating', assignedTo: sales1.id },
    { name: 'Nguyễn Thị Lan', phone: '0912345002', email: 'lan.nt@email.com', zalo: '0912345002', type: 'rent', demand: 'rent', propertyType: 'apartment', areaInterest: 'Quận 7', budget: '8-15 triệu/tháng', timeframe: '1-3 tháng', heatLevel: 'hot', source: 'zalo', status: 'viewing', assignedTo: sales1.id },
    { name: 'Lê Minh Tuấn', phone: '0912345003', email: 'tuan.lm@email.com', type: 'invest', demand: 'buy', propertyType: 'apartment', areaInterest: 'Nhà Bè', budget: '3-5 tỷ', timeframe: '3-6 tháng', heatLevel: 'warm', source: 'website', status: 'consulting', assignedTo: sales1.id },
    { name: 'Phạm Quốc Bảo', phone: '0912345004', email: 'bao.pq@email.com', type: 'buy', demand: 'buy', propertyType: 'house', areaInterest: 'Bình Chánh', budget: '4-6 tỷ', timeframe: '3-6 tháng', heatLevel: 'warm', source: 'referral', status: 'consulting', assignedTo: sales2.id },
    { name: 'Võ Hoàng Yến', phone: '0912345005', email: 'yen.vh@email.com', zalo: '0912345005', type: 'rent', demand: 'rent', propertyType: 'apartment', areaInterest: 'Quận 7', budget: '10-20 triệu/tháng', timeframe: '1-3 tháng', heatLevel: 'hot', source: 'tiktok', status: 'viewing', assignedTo: sales2.id },
    { name: 'Đỗ Thanh Sơn', phone: '0912345006', email: 'son.dt@email.com', type: 'buy', demand: 'buy', propertyType: 'land', areaInterest: 'Nhà Bè', budget: '2-4 tỷ', timeframe: 'trên 6 tháng', heatLevel: 'cold', source: 'listing', status: 'new', assignedTo: sales1.id },
    { name: 'Huỳnh Thị Ngọc', phone: '0912345007', email: 'ngoc.ht@email.com', zalo: '0912345007', type: 'foreign', demand: 'buy', propertyType: 'apartment', areaInterest: 'Quận 7', budget: '3-5 tỷ', timeframe: '3-6 tháng', heatLevel: 'warm', source: 'website', nationality: 'Hàn Quốc', language: 'Tiếng Hàn', status: 'consulting', assignedTo: sales2.id },
    { name: 'Bùi Văn Minh', phone: '0912345008', email: 'minh.bv@email.com', type: 'buy', demand: 'buy', propertyType: 'shophouse', areaInterest: 'Quận 7', budget: '8-12 tỷ', timeframe: '3-6 tháng', heatLevel: 'warm', source: 'partner', status: 'consulting', assignedTo: sales1.id },
    { name: 'Trương Thị Hạnh', phone: '0912345009', email: 'hanh.tt@email.com', type: 'rent', demand: 'rent', propertyType: 'apartment', areaInterest: 'Quận 7', budget: '7-12 triệu/tháng', timeframe: '1-3 tháng', heatLevel: 'hot', source: 'facebook', status: 'negotiating', assignedTo: sales1.id },
    { name: 'Ngô Quang Vinh', phone: '0912345010', email: 'vinh.nq@email.com', type: 'invest', demand: 'buy', propertyType: 'land', areaInterest: 'Bình Chánh', budget: '1-3 tỷ', timeframe: 'trên 6 tháng', heatLevel: 'cold', source: 'offline', status: 'new', assignedTo: sales2.id },
    { name: 'Lý Thị Mai', phone: '0912345011', email: 'mai.lt@email.com', zalo: '0912345011', type: 'buy', demand: 'buy', propertyType: 'apartment', areaInterest: 'Quận 7', budget: '2-4 tỷ', timeframe: '1-3 tháng', heatLevel: 'hot', source: 'zalo', status: 'viewing', assignedTo: sales1.id },
    { name: 'Phan Văn Đức', phone: '0912345012', email: 'duc.pv@email.com', type: 'buy', demand: 'buy', propertyType: 'house', areaInterest: 'Nhà Bè', budget: '5-8 tỷ', timeframe: '3-6 tháng', heatLevel: 'warm', source: 'old_customer', status: 'consulting', assignedTo: sales2.id },
    { name: 'Dương Thị Kim', phone: '0912345013', email: 'kim.dt@email.com', type: 'rent', demand: 'rent', propertyType: 'apartment', areaInterest: 'Quận 7', budget: '12-18 triệu/tháng', timeframe: '1-3 tháng', heatLevel: 'hot', source: 'tiktok', status: 'negotiating', assignedTo: sales1.id },
    { name: 'Hà Quốc Anh', phone: '0912345014', email: 'anh.hq@email.com', type: 'foreign', demand: 'rent', propertyType: 'apartment', areaInterest: 'Quận 7', budget: '15-25 triệu/tháng', timeframe: '1-3 tháng', heatLevel: 'warm', source: 'website', nationality: 'Nhật Bản', language: 'Tiếng Nhật', status: 'consulting', assignedTo: sales2.id },
    { name: 'Trịnh Văn Đạt', phone: '0912345015', email: 'dat.tv@email.com', type: 'invest', demand: 'buy', propertyType: 'apartment', areaInterest: 'Nhà Bè', budget: '2-4 tỷ', timeframe: '3-6 tháng', heatLevel: 'warm', source: 'facebook', status: 'consulting', assignedTo: sales1.id },
    { name: 'Cao Thị Thúy', phone: '0912345016', email: 'thuy.ct@email.com', zalo: '0912345016', type: 'buy', demand: 'buy', propertyType: 'house', areaInterest: 'Bình Chánh', budget: '3-5 tỷ', timeframe: '1-3 tháng', heatLevel: 'hot', source: 'referral', status: 'negotiating', assignedTo: sales2.id },
    { name: 'Lưu Văn Hoàng', phone: '0912345017', email: 'hoang.lv@email.com', type: 'buy', demand: 'buy', propertyType: 'land', areaInterest: 'Nhà Bè', budget: '1-2 tỷ', timeframe: 'trên 6 tháng', heatLevel: 'cold', source: 'listing', status: 'new', assignedTo: sales1.id },
    { name: 'Đinh Thị Nga', phone: '0912345018', email: 'nga.dt@email.com', type: 'rent', demand: 'rent', propertyType: 'apartment', areaInterest: 'Quận 7', budget: '6-10 triệu/tháng', timeframe: '1-3 tháng', heatLevel: 'warm', source: 'zalo', status: 'consulting', assignedTo: sales2.id },
    { name: 'Tăng Minh Long', phone: '0912345019', email: 'long.tm@email.com', type: 'buy', demand: 'buy', propertyType: 'apartment', areaInterest: 'Quận 7', budget: '3-4 tỷ', timeframe: '3-6 tháng', heatLevel: 'warm', source: 'owner', status: 'consulting', assignedTo: sales1.id },
    { name: 'Vũ Thị Hồng', phone: '0912345020', email: 'hong.vt@email.com', zalo: '0912345020', type: 'buy', demand: 'buy', propertyType: 'house', areaInterest: 'Bình Chánh', budget: '4-7 tỷ', timeframe: '1-3 tháng', heatLevel: 'hot', source: 'facebook', status: 'viewing', assignedTo: sales2.id },
    { name: 'Lương Văn Phú', phone: '0912345021', email: 'phu.lv@email.com', type: 'invest', demand: 'buy', propertyType: 'land', areaInterest: 'Nhà Bè', budget: '3-6 tỷ', timeframe: 'trên 6 tháng', heatLevel: 'cold', source: 'partner', status: 'new', assignedTo: sales1.id },
    { name: 'Nguyễn Thị Bích', phone: '0912345022', email: 'bich.nt@email.com', type: 'rent', demand: 'rent', propertyType: 'apartment', areaInterest: 'Quận 7', budget: '8-14 triệu/tháng', timeframe: '1-3 tháng', heatLevel: 'warm', source: 'tiktok', status: 'consulting', assignedTo: sales2.id },
    { name: 'Mai Văn Kiên', phone: '0912345023', email: 'kien.mv@email.com', type: 'buy', demand: 'buy', propertyType: 'shophouse', areaInterest: 'Quận 7', budget: '10-15 tỷ', timeframe: '3-6 tháng', heatLevel: 'warm', source: 'referral', status: 'consulting', assignedTo: sales1.id },
    { name: 'Lê Thị Thu', phone: '0912345024', email: 'thu.lt@email.com', zalo: '0912345024', type: 'foreign', demand: 'buy', propertyType: 'apartment', areaInterest: 'Quận 7', budget: '4-6 tỷ', timeframe: '3-6 tháng', heatLevel: 'hot', source: 'website', nationality: 'Singapore', language: 'Tiếng Anh', status: 'viewing', assignedTo: sales2.id },
    { name: 'Phùng Văn Hải', phone: '0912345025', email: 'hai.pv@email.com', type: 'buy', demand: 'buy', propertyType: 'house', areaInterest: 'Bình Chánh', budget: '3-5 tỷ', timeframe: '1-3 tháng', heatLevel: 'warm', source: 'zalo', status: 'consulting', assignedTo: sales1.id },
    { name: 'Trần Thị Xuân', phone: '0912345026', email: 'xuan.tt@email.com', type: 'rent', demand: 'rent', propertyType: 'apartment', areaInterest: 'Quận 7', budget: '10-15 triệu/tháng', timeframe: '1-3 tháng', heatLevel: 'hot', source: 'facebook', status: 'negotiating', assignedTo: sales2.id },
    { name: 'Vương Quốc Thắng', phone: '0912345027', email: 'thang.vq@email.com', type: 'invest', demand: 'buy', propertyType: 'apartment', areaInterest: 'Nhà Bè', budget: '2-3 tỷ', timeframe: '3-6 tháng', heatLevel: 'cold', source: 'offline', status: 'new', assignedTo: sales1.id },
    { name: 'Đặng Thị Huệ', phone: '0912345028', email: 'hue.dt@email.com', type: 'buy', demand: 'buy', propertyType: 'land', areaInterest: 'Bình Chánh', budget: '1-3 tỷ', timeframe: 'trên 6 tháng', heatLevel: 'cold', source: 'listing', status: 'new', assignedTo: sales2.id },
    { name: 'Bạch Văn Tùng', phone: '0912345029', email: 'tung.bv@email.com', zalo: '0912345029', type: 'buy', demand: 'buy', propertyType: 'apartment', areaInterest: 'Quận 7', budget: '2.5-3.5 tỷ', timeframe: '1-3 tháng', heatLevel: 'hot', source: 'zalo', status: 'negotiating', assignedTo: sales1.id },
    { name: 'Chu Thị Oanh', phone: '0912345030', email: 'oanh.ct@email.com', type: 'rent', demand: 'rent', propertyType: 'apartment', areaInterest: 'Quận 7', budget: '9-13 triệu/tháng', timeframe: '1-3 tháng', heatLevel: 'warm', source: 'facebook', status: 'consulting', assignedTo: sales2.id },
    { name: 'Kiều Văn Thành', phone: '0912345031', email: 'thanh.kv@email.com', type: 'buy', demand: 'buy', propertyType: 'house', areaInterest: 'Nhà Bè', budget: '5-8 tỷ', timeframe: '3-6 tháng', heatLevel: 'warm', source: 'old_customer', status: 'consulting', assignedTo: sales1.id },
    { name: 'Thái Thị Ngọc Anh', phone: '0912345032', email: 'anh.tt@email.com', type: 'foreign', demand: 'rent', propertyType: 'apartment', areaInterest: 'Quận 7', budget: '20-30 triệu/tháng', timeframe: '1-3 tháng', heatLevel: 'hot', source: 'website', nationality: 'Mỹ', language: 'Tiếng Anh', status: 'viewing', assignedTo: sales2.id },
    { name: 'La Văn Tiến', phone: '0912345033', email: 'tien.lv@email.com', type: 'buy', demand: 'buy', propertyType: 'land', areaInterest: 'Nhà Bè', budget: '2-4 tỷ', timeframe: '3-6 tháng', heatLevel: 'cold', source: 'partner', status: 'lost', assignedTo: sales1.id },
  ];

  const customers = [];
  for (let i = 0; i < customerData.length; i++) {
    const c = customerData[i];
    const customer = await prisma.customer.create({
      data: {
        code: `KH-${String(i + 1).padStart(3, '0')}`,
        name: c.name,
        phone: c.phone,
        email: c.email || null,
        zalo: c.zalo || null,
        nationality: c.nationality || 'Việt Nam',
        language: c.language || 'Tiếng Việt',
        type: c.type,
        demand: c.demand,
        propertyType: c.propertyType || null,
        areaInterest: c.areaInterest || null,
        budget: c.budget || null,
        timeframe: c.timeframe || null,
        heatLevel: c.heatLevel,
        source: c.source || null,
        assignedTo: c.assignedTo || null,
        notes: c.heatLevel === 'hot' ? 'Khách ưu tiên cao, cần follow-up nhanh' : null,
        lastContact: c.heatLevel === 'hot' ? daysAgo(1) : c.heatLevel === 'warm' ? daysAgo(5) : daysAgo(14),
        nextFollowUp: c.heatLevel === 'hot' ? daysFromNow(1) : c.heatLevel === 'warm' ? daysFromNow(3) : daysFromNow(7),
        status: c.status,
        createdAt: daysAgo(Math.floor(Math.random() * 60) + 1),
      },
    });
    customers.push(customer);
  }

  console.log(`Created ${customers.length} customers`);

  // ==================== OWNERS ====================
  const ownerData = [
    { name: 'Trần Đức Anh', phone: '0981111001', contactChannel: 'zalo', area: 'Quận 7', cooperationLevel: 'A', trustLevel: 'high', commissionPolicy: '2% giá trị giao dịch', notes: 'Rất hợp tác, hay giới thiệu khách' },
    { name: 'Nguyễn Minh Tâm', phone: '0981111002', contactChannel: 'điện thoại', area: 'Quận 7', cooperationLevel: 'A', trustLevel: 'high', commissionPolicy: '1.5% giá trị giao dịch', notes: 'Chủ nhà lâu năm, nhiều BĐS tốt' },
    { name: 'Lê Thị Hoa', phone: '0981111003', contactChannel: 'gặp trực tiếp', area: 'Nhà Bè', cooperationLevel: 'B', trustLevel: 'medium', commissionPolicy: '2% giá trị giao dịch', notes: 'Cần gặp mặt mới dễ đàm phán' },
    { name: 'Phạm Văn Kiệt', phone: '0981111004', contactChannel: 'zalo', area: 'Bình Chánh', cooperationLevel: 'B', trustLevel: 'medium', commissionPolicy: 'Thỏa thuận theo deal', notes: 'Hay thay đổi ý kiến' },
    { name: 'Võ Thị Mai', phone: '0981111005', contactChannel: 'điện thoại', area: 'Quận 7', cooperationLevel: 'A', trustLevel: 'high', commissionPolicy: '1 tháng tiền thuê', notes: 'Rồi乐于 hợp tác, BĐS chất lượng' },
    { name: 'Huỳnh Đức Trung', phone: '0981111006', contactChannel: 'gặp trực tiếp', area: 'Nhà Bè', cooperationLevel: 'C', trustLevel: 'low', commissionPolicy: 'Chưa rõ', notes: 'Khó tiếp cận, hay hẹn rồi bận' },
    { name: 'Đỗ Thị Nga', phone: '0981111007', contactChannel: 'zalo', area: 'Quận 7', cooperationLevel: 'A', trustLevel: 'high', commissionPolicy: '1.5% bán, 1 tháng thuê', notes: 'Chủ nhà thân thiện, phản hồi nhanh' },
    { name: 'Bùi Quốc Huy', phone: '0981111008', contactChannel: 'điện thoại', area: 'Bình Chánh', cooperationLevel: 'B', trustLevel: 'medium', commissionPolicy: '2% giá trị giao dịch', notes: 'Có nhiều đất ở Bình Chánh' },
    { name: 'Lý Văn Phú', phone: '0981111009', contactChannel: 'gặp trực tiếp', area: 'Nhà Bè', cooperationLevel: 'B', trustLevel: 'medium', commissionPolicy: 'Thỏa thuận', notes: 'Cần thời gian xây dựng quan hệ' },
    { name: 'Trịnh Thị Lan', phone: '0981111010', contactChannel: 'zalo', area: 'Quận 7', cooperationLevel: 'A', trustLevel: 'high', commissionPolicy: '1 tháng tiền thuê', notes: 'Rất chuyên nghiệp, BĐS cao cấp' },
    { name: 'Ngô Đức Thắng', phone: '0981111011', contactChannel: 'điện thoại', area: 'Bình Chánh', cooperationLevel: 'C', trustLevel: 'low', commissionPolicy: 'Chưa thỏa thuận', notes: 'Hay nghi ngờ, cần xây dựng lòng tin' },
  ];

  const owners = [];
  for (let i = 0; i < ownerData.length; i++) {
    const o = ownerData[i];
    const owner = await prisma.owner.create({
      data: {
        code: `CH-${String(i + 1).padStart(3, '0')}`,
        name: o.name,
        phone: o.phone,
        contactChannel: o.contactChannel,
        area: o.area,
        cooperationLevel: o.cooperationLevel,
        trustLevel: o.trustLevel,
        commissionPolicy: o.commissionPolicy,
        notes: o.notes,
        lastContact: daysAgo(Math.floor(Math.random() * 14) + 1),
        nextUpdate: daysFromNow(Math.floor(Math.random() * 14) + 1),
      },
    });
    owners.push(owner);
  }

  console.log(`Created ${owners.length} owners`);

  // ==================== PROPERTIES ====================
  const propertyData = [
    { title: 'Căn hộ 2PN Vincom Riverside', propertyType: 'apartment', demand: 'rent', area: 'Quận 7', address: 'Số 12, Đường Nguyễn Hữu Thọ, Phường Tân Hưng, Quận 7', project: 'Vincom Riverside', landArea: null, useArea: 75, bedrooms: 2, bathrooms: 2, furniture: 'Đầy đủ', direction: 'Nam', price: 18000000, expectedPrice: 15000000, legalStatus: 'Sổ hồng', planningStatus: 'Không quy hoạch', ownerId: owners[0].id, status: 'active', attractiveness: 'high', easyToClose: 'high', isHot: true, isExclusive: true, assignedTo: sales1.id },
    { title: 'Căn hộ 3PN Masteri Millennium', propertyType: 'apartment', demand: 'sell', area: 'Quận 7', address: 'Số 8, Đường Nguyễn Văn Linh, Phường Tân Phong, Quận 7', project: 'Masteri Millennium', landArea: null, useArea: 105, bedrooms: 3, bathrooms: 2, furniture: 'Đầy đủ', direction: 'Đông Nam', price: 3500000000, expectedPrice: 3200000000, legalStatus: 'Sổ hồng', planningStatus: 'Không quy hoạch', ownerId: owners[1].id, status: 'active', attractiveness: 'high', easyToClose: 'medium', isHot: true, isExclusive: false, assignedTo: sales1.id },
    { title: 'Nhà phố 1 trệt 2 lầu khu Phú Mỹ', propertyType: 'house', demand: 'sell', area: 'Quận 7', address: 'Đường Phú Mỹ, Phường Phú Mỹ, Quận 7', project: 'Khu dân cư Phú Mỹ', landArea: 60, useArea: 160, bedrooms: 4, bathrooms: 3, furniture: 'Cơ bản', direction: 'Tây Nam', price: 5500000000, expectedPrice: 5000000000, legalStatus: 'Sổ hồng', planningStatus: 'Không quy hoạch', ownerId: owners[4].id, status: 'active', attractiveness: 'high', easyToClose: 'medium', isHot: true, isExclusive: false, assignedTo: sales2.id },
    { title: 'Đất nền KDC Nam Long', propertyType: 'land', demand: 'sell', area: 'Nhà Bè', address: 'KDC Nam Long, Xã Nhơn Đức, Huyện Nhà Bè', project: 'KDC Nam Long', landArea: 100, useArea: null, bedrooms: null, bathrooms: null, furniture: null, direction: 'Nam', price: 2800000000, expectedPrice: 2500000000, legalStatus: 'Sổ đỏ', planningStatus: 'Không quy hoạch', ownerId: owners[2].id, status: 'active', attractiveness: 'medium', easyToClose: 'medium', isHot: false, isExclusive: false, assignedTo: sales1.id },
    { title: 'Căn hộ 2PN Sunrise City', propertyType: 'apartment', demand: 'rent', area: 'Quận 7', address: 'Số 23, Đường Nguyễn Hữu Thọ, Phường Tân Hưng, Quận 7', project: 'Sunrise City', landArea: null, useArea: 82, bedrooms: 2, bathrooms: 2, furniture: 'Đầy đủ', direction: 'Đông', price: 14000000, expectedPrice: 12000000, legalStatus: 'Sổ hồng', planningStatus: 'Không quy hoạch', ownerId: owners[6].id, status: 'active', attractiveness: 'high', easyToClose: 'high', isHot: true, isExclusive: true, assignedTo: sales1.id },
    { title: 'Shophouse KDC Phú Mỹ Hưng', propertyType: 'shophouse', demand: 'sell', area: 'Quận 7', address: 'Đường Nguyễn Văn Linh, Phường Tân Phong, Quận 7', project: 'Phú Mỹ Hưng', landArea: 80, useArea: 240, bedrooms: 0, bathrooms: 3, furniture: 'Cơ bản', direction: 'Đông Nam', price: 12000000000, expectedPrice: 11000000000, legalStatus: 'Sổ hồng', planningStatus: 'Không quy hoạch', ownerId: owners[9].id, status: 'active', attractiveness: 'high', easyToClose: 'low', isHot: true, isExclusive: true, assignedTo: sales2.id },
    { title: 'Đất nền 5x20 Hương Lộ 2', propertyType: 'land', demand: 'sell', area: 'Bình Chánh', address: 'Đường Hương Lộ 2, Xã Bình Hưng, Huyện Bình Chánh', project: null, landArea: 100, useArea: null, bedrooms: null, bathrooms: null, furniture: null, direction: 'Tây', price: 1500000000, expectedPrice: 1300000000, legalStatus: 'Sổ đỏ', planningStatus: 'Cần kiểm tra', ownerId: owners[3].id, status: 'active', attractiveness: 'medium', easyToClose: 'low', isHot: false, isExclusive: false, assignedTo: sales2.id },
    { title: 'Căn hộ 1PN Cabinet Towers', propertyType: 'apartment', demand: 'rent', area: 'Quận 7', address: 'Số 5, Đường Tân Trào, Phường Tân Phú, Quận 7', project: 'Cabinet Towers', landArea: null, useArea: 45, bedrooms: 1, bathrooms: 1, furniture: 'Đầy đủ', direction: 'Bắc', price: 9000000, expectedPrice: 8000000, legalStatus: 'Sổ hồng', planningStatus: 'Không quy hoạch', ownerId: owners[0].id, status: 'active', attractiveness: 'medium', easyToClose: 'high', isHot: false, isExclusive: false, assignedTo: sales1.id },
    { title: 'Nhà phố 1 trệt 1 lầu Nhà Bè', propertyType: 'house', demand: 'sell', area: 'Nhà Bè', address: 'Đường Nguyễn Bình, Xã Phú Xuân, Huyện Nhà Bè', project: 'KDC Phú Xuân', landArea: 72, useArea: 120, bedrooms: 3, bathrooms: 2, furniture: 'Không nội thất', direction: 'Nam', price: 4200000000, expectedPrice: 3800000000, legalStatus: 'Sổ hồng', planningStatus: 'Không quy hoạch', ownerId: owners[8].id, status: 'active', attractiveness: 'medium', easyToClose: 'medium', isHot: false, isExclusive: false, assignedTo: sales2.id },
    { title: 'Căn hộ 3PN Imperium', propertyType: 'apartment', demand: 'sell', area: 'Quận 7', address: 'Số 2A, Đường Nguyễn Văn Linh, Phường Tân Phong, Quận 7', project: 'Imperium', landArea: null, useArea: 120, bedrooms: 3, bathrooms: 2, furniture: 'Đầy đủ', direction: 'Đông Nam', price: 4200000000, expectedPrice: 3800000000, legalStatus: 'Sổ hồng', planningStatus: 'Không quy hoạch', ownerId: owners[1].id, status: 'active', attractiveness: 'high', easyToClose: 'medium', isHot: false, isExclusive: false, assignedTo: sales1.id },
    { title: 'Đất nền KDC Long Phước', propertyType: 'land', demand: 'sell', area: 'Nhà Bè', address: 'KDC Long Phước, Xã Long Phước, Huyện Nhà Bè', project: 'KDC Long Phước', landArea: 120, useArea: null, bedrooms: null, bathrooms: null, furniture: null, direction: 'Đông', price: 3500000000, expectedPrice: 3000000000, legalStatus: 'Hợp đồng', planningStatus: 'Cần kiểm tra', ownerId: owners[5].id, status: 'paused', attractiveness: 'low', easyToClose: 'low', isHot: false, isExclusive: false, assignedTo: sales1.id },
    { title: 'Căn hộ 2PN Pegas Residence', propertyType: 'apartment', demand: 'rent', area: 'Quận 7', address: 'Số 15, Đường Tân Trào, Phường Tân Phú, Quận 7', project: 'Pegas Residence', landArea: null, useArea: 68, bedrooms: 2, bathrooms: 1, furniture: 'Cơ bản', direction: 'Tây Nam', price: 11000000, expectedPrice: 10000000, legalStatus: 'Sổ hồng', planningStatus: 'Không quy hoạch', ownerId: owners[4].id, status: 'active', attractiveness: 'medium', easyToClose: 'high', isHot: false, isExclusive: false, assignedTo: sales2.id },
    { title: 'Nhà cấp 4 Bình Chánh', propertyType: 'house', demand: 'sell', area: 'Bình Chánh', address: 'Đường Trần Đại Nghĩa, Xã Bình Hưng, Huyện Bình Chánh', project: null, landArea: 80, useArea: 65, bedrooms: 2, bathrooms: 1, furniture: 'Không nội thất', direction: 'Nam', price: 2500000000, expectedPrice: 2200000000, legalStatus: 'Sổ đỏ', planningStatus: 'Không quy hoạch', ownerId: owners[7].id, status: 'active', attractiveness: 'medium', easyToClose: 'medium', isHot: false, isExclusive: false, assignedTo: sales2.id },
    { title: 'Căn hộ 2PN Centum Capital', propertyType: 'apartment', demand: 'sell', area: 'Quận 7', address: 'Số 18, Đường Nguyễn Văn Linh, Phường Tân Phong, Quận 7', project: 'Centum Capital', landArea: null, useArea: 78, bedrooms: 2, bathrooms: 2, furniture: 'Đầy đủ', direction: 'Đông Bắc', price: 2900000000, expectedPrice: 2600000000, legalStatus: 'Sổ hồng', planningStatus: 'Không quy hoạch', ownerId: owners[6].id, status: 'active', attractiveness: 'high', easyToClose: 'medium', isHot: false, isExclusive: false, assignedTo: sales1.id },
    { title: 'Đất nền 8x20 KDC Tân Quy', propertyType: 'land', demand: 'sell', area: 'Bình Chánh', address: 'KDC Tân Quy, Xã Tân Quy, Huyện Bình Chánh', project: 'KDC Tân Quy', landArea: 160, useArea: null, bedrooms: null, bathrooms: null, furniture: null, direction: 'Nam', price: 2200000000, expectedPrice: 1900000000, legalStatus: 'Sổ đỏ', planningStatus: 'Không quy hoạch', ownerId: owners[7].id, status: 'active', attractiveness: 'medium', easyToClose: 'medium', isHot: false, isExclusive: false, assignedTo: sales2.id },
    { title: 'Căn hộ Studio Sky Center', propertyType: 'apartment', demand: 'rent', area: 'Quận 7', address: 'Số 10, Đường Nguyễn Hữu Thọ, Phường Tân Hưng, Quận 7', project: 'Sky Center', landArea: null, useArea: 35, bedrooms: 1, bathrooms: 1, furniture: 'Đầy đủ', direction: 'Đông', price: 8000000, expectedPrice: 7000000, legalStatus: 'Sổ hồng', planningStatus: 'Không quy hoạch', ownerId: owners[0].id, status: 'active', attractiveness: 'medium', easyToClose: 'high', isHot: false, isExclusive: false, assignedTo: sales1.id },
    { title: 'Nhà phố 1 trệt 2 lầu Tân Quy Đông', propertyType: 'house', demand: 'sell', area: 'Bình Chánh', address: 'Đường Tân Quy Đông, Xã Tân Quy, Huyện Bình Chánh', project: 'KDC Tân Quy Đông', landArea: 55, useArea: 150, bedrooms: 3, bathrooms: 2, furniture: 'Cơ bản', direction: 'Đông Nam', price: 4800000000, expectedPrice: 4400000000, legalStatus: 'Sổ hồng', planningStatus: 'Không quy hoạch', ownerId: owners[3].id, status: 'active', attractiveness: 'medium', easyToClose: 'medium', isHot: false, isExclusive: false, assignedTo: sales2.id },
    { title: 'Căn hộ 2PN Scenic Valley', propertyType: 'apartment', demand: 'rent', area: 'Quận 7', address: 'Đường Nguyễn Văn Linh, Phường Tân Phong, Quận 7', project: 'Scenic Valley - Phú Mỹ Hưng', landArea: null, useArea: 88, bedrooms: 2, bathrooms: 2, furniture: 'Đầy đủ', direction: 'Nam', price: 22000000, expectedPrice: 20000000, legalStatus: 'Sổ hồng', planningStatus: 'Không quy hoạch', ownerId: owners[9].id, status: 'active', attractiveness: 'high', easyToClose: 'high', isHot: true, isExclusive: true, assignedTo: sales1.id },
    { title: 'Căn hộ 3PN The Crescent', propertyType: 'apartment', demand: 'sell', area: 'Quận 7', address: 'Đường Nguyễn Văn Linh, Phường Tân Phong, Quận 7', project: 'The Crescent - Phú Mỹ Hưng', landArea: null, useArea: 135, bedrooms: 3, bathrooms: 2, furniture: 'Đầy đủ', direction: 'Đông Nam', price: 5800000000, expectedPrice: 5300000000, legalStatus: 'Sổ hồng', planningStatus: 'Không quy hoạch', ownerId: owners[9].id, status: 'active', attractiveness: 'high', easyToClose: 'medium', isHot: true, isExclusive: false, assignedTo: sales2.id },
    { title: 'Đất nền 10x25 Nguyễn Bình', propertyType: 'land', demand: 'sell', area: 'Nhà Bè', address: 'Đường Nguyễn Bình, Xã Phú Xuân, Huyện Nhà Bè', project: null, landArea: 250, useArea: null, bedrooms: null, bathrooms: null, furniture: null, direction: 'Đông Nam', price: 5000000000, expectedPrice: 4500000000, legalStatus: 'Sổ đỏ', planningStatus: 'Không quy hoạch', ownerId: owners[2].id, status: 'active', attractiveness: 'medium', easyToClose: 'medium', isHot: false, isExclusive: false, assignedTo: sales1.id },
    { title: 'Căn hộ 2PN Felix Homes', propertyType: 'apartment', demand: 'sell', area: 'Quận 7', address: 'Đường Đặng Văn Ngữ, Phường Tân Phong, Quận 7', project: 'Felix Homes', landArea: null, useArea: 70, bedrooms: 2, bathrooms: 1, furniture: 'Cơ bản', direction: 'Bắc', price: 2300000000, expectedPrice: 2100000000, legalStatus: 'Hợp đồng', planningStatus: 'Không quy hoạch', ownerId: owners[1].id, status: 'new', attractiveness: 'medium', easyToClose: 'medium', isHot: false, isExclusive: false, assignedTo: sales1.id },
    { title: 'Shophouse Tân Phong', propertyType: 'shophouse', demand: 'sell', area: 'Quận 7', address: 'Đường Tân Phong, Phường Tân Phong, Quận 7', project: 'KDC Tân Phong', landArea: 70, useArea: 210, bedrooms: 0, bathrooms: 2, furniture: 'Cơ bản', direction: 'Đông', price: 9500000000, expectedPrice: 8800000000, legalStatus: 'Sổ hồng', planningStatus: 'Không quy hoạch', ownerId: owners[4].id, status: 'active', attractiveness: 'high', easyToClose: 'low', isHot: false, isExclusive: false, assignedTo: sales2.id },
    { title: 'Căn hộ 2PN Green View', propertyType: 'apartment', demand: 'rent', area: 'Quận 7', address: 'Số 20, Đường Nguyễn Hữu Thọ, Phường Tân Hưng, Quận 7', project: 'Green View', landArea: null, useArea: 72, bedrooms: 2, bathrooms: 2, furniture: 'Cơ bản', direction: 'Nam', price: 13000000, expectedPrice: 11000000, legalStatus: 'Sổ hồng', planningStatus: 'Không quy hoạch', ownerId: owners[6].id, status: 'active', attractiveness: 'medium', easyToClose: 'high', isHot: false, isExclusive: false, assignedTo: sales1.id },
    { title: 'Nhà phố Phú Xuân Nhà Bè', propertyType: 'house', demand: 'sell', area: 'Nhà Bè', address: 'KDC Phú Xuân, Xã Phú Xuân, Huyện Nhà Bè', project: 'KDC Phú Xuân', landArea: 65, useArea: 180, bedrooms: 4, bathrooms: 3, furniture: 'Đầy đủ', direction: 'Đông Nam', price: 6200000000, expectedPrice: 5700000000, legalStatus: 'Sổ hồng', planningStatus: 'Không quy hoạch', ownerId: owners[8].id, status: 'active', attractiveness: 'high', easyToClose: 'medium', isHot: true, isExclusive: false, assignedTo: sales2.id },
    { title: 'Căn hộ 1PN+1 My Casa', propertyType: 'apartment', demand: 'rent', area: 'Quận 7', address: 'Số 7, Đường Tân Trào, Phường Tân Phú, Quận 7', project: 'My Casa', landArea: null, useArea: 50, bedrooms: 1, bathrooms: 1, furniture: 'Đầy đủ', direction: 'Đông', price: 10000000, expectedPrice: 9000000, legalStatus: 'Sổ hồng', planningStatus: 'Không quy hoạch', ownerId: owners[0].id, status: 'active', attractiveness: 'medium', easyToClose: 'high', isHot: false, isExclusive: false, assignedTo: sales1.id },
  ];

  const properties = [];
  for (let i = 0; i < propertyData.length; i++) {
    const p = propertyData[i];
    const property = await prisma.property.create({
      data: {
        code: `SP-${String(i + 1).padStart(3, '0')}`,
        title: p.title,
        propertyType: p.propertyType,
        demand: p.demand,
        area: p.area,
        address: p.address,
        project: p.project || null,
        landArea: p.landArea,
        useArea: p.useArea,
        bedrooms: p.bedrooms,
        bathrooms: p.bathrooms,
        furniture: p.furniture,
        direction: p.direction,
        price: p.price,
        expectedPrice: p.expectedPrice,
        legalStatus: p.legalStatus,
        planningStatus: p.planningStatus,
        ownerId: p.ownerId || null,
        status: p.status,
        attractiveness: p.attractiveness,
        easyToClose: p.easyToClose,
        isHot: p.isHot,
        isExclusive: p.isExclusive,
        description: `${p.title} - Vị trí đắc địa tại ${p.area}, phù hợp cho ${p.demand === 'rent' ? 'cho thuê' : 'mua bán'}.`,
        assignedTo: p.assignedTo || null,
        lastUpdated: daysAgo(Math.floor(Math.random() * 7)),
        createdAt: daysAgo(Math.floor(Math.random() * 90) + 1),
      },
    });
    properties.push(property);
  }

  console.log(`Created ${properties.length} properties`);

  // ==================== PRICE HISTORY ====================
  // Add price history for some properties
  for (let i = 0; i < 10; i++) {
    const prop = properties[i];
    const priceChange = prop.price * 0.95;
    await prisma.priceHistory.create({
      data: {
        propertyId: prop.id,
        price: priceChange,
        note: 'Giá ban đầu khi tiếp nhận',
        date: daysAgo(60),
      },
    });
    await prisma.priceHistory.create({
      data: {
        propertyId: prop.id,
        price: prop.price,
        note: 'Điều chỉnh giá theo thị trường',
        date: daysAgo(15),
      },
    });
  }

  console.log('Created price history entries');

  // ==================== INTERACTIONS ====================
  const interactionTypes = ['call', 'message', 'viewing', 'note', 'email'];
  const interactionContents = [
    'Khách hỏi về giá, đang cân nhắc',
    'Gọi điện tư vấn, khách hẹn xem nhà',
    'Đã xem nhà, khách khá ưng ý, cần suy nghĩ thêm',
    'Khách muốn giảm giá, cần đàm phán với chủ nhà',
    'Nhắn Zalo gửi thêm hình ảnh căn hộ',
    'Khách phản hồi tích cực, muốn đặt cọc',
    'Gửi email báo giá chi tiết',
    'Khách báo cần thêm thời gian suy nghĩ',
    'Hẹn xem nhà lần 2 với gia đình',
    'Khách hỏi về pháp lý sổ hồng',
    'Gọi follow-up, khách đang bận sẽ gọi lại',
    'Khách muốn xem thêm các căn khác để so sánh',
    'Tư vấn về khu vực và tiện ích xung quanh',
    'Khách nước ngoài cần hỗ trợ thủ tục',
    'Gửi hợp đồng môi giới để xem trước',
  ];

  for (let i = 0; i < customers.length; i++) {
    const customer = customers[i];
    const numInteractions = customer.heatLevel === 'hot' ? 3 : customer.heatLevel === 'warm' ? 2 : 1;
    for (let j = 0; j < numInteractions; j++) {
      await prisma.interaction.create({
        data: {
          customerId: customer.id,
          type: interactionTypes[Math.floor(Math.random() * interactionTypes.length)],
          content: interactionContents[Math.floor(Math.random() * interactionContents.length)],
          date: daysAgo(Math.floor(Math.random() * 30) + 1),
        },
      });
    }
  }

  console.log('Created interactions');

  // ==================== PROPERTY VIEWS ====================
  // Link some customers to properties they viewed
  const viewingCustomers = [0, 1, 4, 8, 10, 12, 15, 19, 24, 25, 29, 31]; // indices of customers who viewed
  const viewingFeedbacks = [
    'Rất ưng ý, đang cân nhắc giá',
    'Căn hộ đẹp nhưng giá hơi cao so với ngân sách',
    'Vị trí tốt, tiện ích đầy đủ',
    'Cần xem thêm thời gian trước khi quyết định',
    'Hài lòng với không gian, sẽ bàn lại với gia đình',
    'Phù hợp nhu cầu, muốn đàm phán giá',
    'Căn hộ quá nhỏ so với mong đợi',
    'Rất thích, muốn tiến hành đặt cọc',
    'Khu vực yên tĩnh, phù hợp gia đình',
    'Cần xem thêm các căn khác để so sánh',
  ];

  for (const ci of viewingCustomers) {
    if (ci >= customers.length) continue;
    const numViews = Math.floor(Math.random() * 3) + 1;
    for (let v = 0; v < numViews; v++) {
      const pi = Math.floor(Math.random() * properties.length);
      try {
        await prisma.propertyView.create({
          data: {
            propertyId: properties[pi].id,
            customerId: customers[ci].id,
            feedback: viewingFeedbacks[Math.floor(Math.random() * viewingFeedbacks.length)],
            date: daysAgo(Math.floor(Math.random() * 21) + 1),
          },
        });
      } catch {
        // Skip if duplicate
      }
    }
  }

  console.log('Created property views');

  // ==================== DEALS ====================
  const dealData = [
    { type: 'sell', value: 3200000000, expectedCommission: 64000000, actualCommission: null, stage: 'negotiating', risk: 'Khách chờ giảm giá thêm', nextStep: 'Đàm phán giá với chủ nhà', assignedTo: sales1.id, expectedCloseDate: daysFromNow(14) },
    { type: 'rent', value: 180000000, expectedCommission: 18000000, actualCommission: null, stage: 'viewed', risk: 'Khách đang so sánh với căn khác', nextStep: 'Hẹn xem lại căn hộ', assignedTo: sales1.id, expectedCloseDate: daysFromNow(7) },
    { type: 'sell', value: 5000000000, expectedCommission: 100000000, actualCommission: null, stage: 'deposited', risk: 'Chờ hoàn thiện pháp lý', nextStep: 'Hoàn tất hợp đồng', assignedTo: sales2.id, expectedCloseDate: daysFromNow(5) },
    { type: 'rent', value: 150000000, expectedCommission: 15000000, actualCommission: 15000000, stage: 'completed', risk: null, nextStep: null, assignedTo: sales1.id, expectedCloseDate: daysAgo(5) },
    { type: 'sell', value: 2800000000, expectedCommission: 56000000, actualCommission: null, stage: 'product_sent', risk: 'Chưa rõ ngân sách khách', nextStep: 'Gọi điện xác nhận nhu cầu', assignedTo: sales1.id, expectedCloseDate: daysFromNow(21) },
    { type: 'sell', value: 4200000000, expectedCommission: 84000000, actualCommission: null, stage: 'need_identified', risk: null, nextStep: 'Gửi danh sách BĐS phù hợp', assignedTo: sales2.id, expectedCloseDate: daysFromNow(30) },
    { type: 'rent', value: 240000000, expectedCommission: 20000000, actualCommission: null, stage: 'negotiating', risk: 'Chủ nhà chưa đồng ý giá', nextStep: 'Thuyết phục chủ nhà giảm giá', assignedTo: sales1.id, expectedCloseDate: daysFromNow(10) },
    { type: 'sell', value: 11000000000, expectedCommission: 165000000, actualCommission: null, stage: 'new_lead', risk: 'Khách mới, chưa rõ nhu cầu chi tiết', nextStep: 'Liên hệ tư vấn', assignedTo: sales2.id, expectedCloseDate: daysFromNow(45) },
    { type: 'sell', value: 3800000000, expectedCommission: 76000000, actualCommission: 76000000, stage: 'completed', risk: null, nextStep: null, assignedTo: sales1.id, expectedCloseDate: daysAgo(10) },
    { type: 'rent', value: 120000000, expectedCommission: 12000000, actualCommission: null, stage: 'viewed', risk: 'Khách cần thời gian suy nghĩ', nextStep: 'Follow-up sau 3 ngày', assignedTo: sales2.id, expectedCloseDate: daysFromNow(14) },
    { type: 'sell', value: 5500000000, expectedCommission: 110000000, actualCommission: null, stage: 'negotiating', risk: 'Giấy tờ pháp lý đang xử lý', nextStep: 'Kiểm tra tiến độ pháp lý', assignedTo: sales1.id, expectedCloseDate: daysFromNow(7) },
    { type: 'sell', value: 2600000000, expectedCommission: 52000000, actualCommission: null, stage: 'lost', risk: 'Khách chọn BĐS của đối thủ', nextStep: null, assignedTo: sales2.id, expectedCloseDate: daysAgo(3) },
    { type: 'rent', value: 200000000, expectedCommission: 20000000, actualCommission: null, stage: 'deposited', risk: null, nextStep: 'Ký hợp đồng thuê', assignedTo: sales1.id, expectedCloseDate: daysFromNow(3) },
    { type: 'sell', value: 4500000000, expectedCommission: 90000000, actualCommission: null, stage: 'product_sent', risk: 'Khách chưa phản hồi', nextStep: 'Gọi điện nhắc nhở', assignedTo: sales2.id, expectedCloseDate: daysFromNow(21) },
    { type: 'sell', value: 6200000000, expectedCommission: 124000000, actualCommission: null, stage: 'new_lead', risk: null, nextStep: 'Tìm hiểu nhu cầu chi tiết', assignedTo: sales1.id, expectedCloseDate: daysFromNow(30) },
  ];

  const deals = [];
  for (let i = 0; i < dealData.length; i++) {
    const d = dealData[i];
    const deal = await prisma.deal.create({
      data: {
        code: `GD-${String(i + 1).padStart(3, '0')}`,
        type: d.type,
        value: d.value,
        expectedCommission: d.expectedCommission,
        actualCommission: d.actualCommission,
        stage: d.stage,
        expectedCloseDate: d.expectedCloseDate,
        risk: d.risk,
        nextStep: d.nextStep,
        assignedTo: d.assignedTo || null,
        notes: d.stage === 'completed' ? 'Giao dịch hoàn tất thành công' : d.stage === 'lost' ? 'Khách đã chọn BĐS khác' : null,
        createdAt: daysAgo(Math.floor(Math.random() * 30) + 1),
      },
    });
    deals.push(deal);
  }

  console.log(`Created ${deals.length} deals`);

  // ==================== DEAL CUSTOMERS & DEAL PROPERTIES ====================
  // Link deals to customers and properties
  const dealCustomerLinks = [
    { dealIdx: 0, customerIdx: 0 },   // deal 1 - Trần Văn Hùng
    { dealIdx: 1, customerIdx: 1 },   // deal 2 - Nguyễn Thị Lan
    { dealIdx: 2, customerIdx: 4 },   // deal 3 - Võ Hoàng Yến
    { dealIdx: 3, customerIdx: 8 },   // deal 4 - Trương Thị Hạnh
    { dealIdx: 4, customerIdx: 2 },   // deal 5 - Lê Minh Tuấn
    { dealIdx: 5, customerIdx: 3 },   // deal 6 - Phạm Quốc Bảo
    { dealIdx: 6, customerIdx: 12 },  // deal 7 - Dương Thị Kim
    { dealIdx: 7, customerIdx: 7 },   // deal 8 - Bùi Văn Minh
    { dealIdx: 8, customerIdx: 15 },  // deal 9 - Cao Thị Thúy
    { dealIdx: 9, customerIdx: 13 },  // deal 10 - Hà Quốc Anh
    { dealIdx: 10, customerIdx: 19 }, // deal 11 - Vũ Thị Hồng
    { dealIdx: 11, customerIdx: 9 },  // deal 12 - Ngô Quang Vinh
    { dealIdx: 12, customerIdx: 25 }, // deal 13 - Trần Thị Xuân
    { dealIdx: 13, customerIdx: 6 },  // deal 14 - Huỳnh Thị Ngọc
    { dealIdx: 14, customerIdx: 23 }, // deal 15 - Lê Thị Thu
  ];

  for (const link of dealCustomerLinks) {
    if (link.dealIdx < deals.length && link.customerIdx < customers.length) {
      await prisma.dealCustomer.create({
        data: {
          dealId: deals[link.dealIdx].id,
          customerId: customers[link.customerIdx].id,
        },
      });
    }
  }

  const dealPropertyLinks = [
    { dealIdx: 0, propertyIdx: 1 },   // Masteri Millennium
    { dealIdx: 1, propertyIdx: 0 },   // Vincom Riverside
    { dealIdx: 2, propertyIdx: 2 },   // Nhà phố Phú Mỹ
    { dealIdx: 3, propertyIdx: 4 },   // Sunrise City
    { dealIdx: 4, propertyIdx: 3 },   // Đất Nam Long
    { dealIdx: 5, propertyIdx: 8 },   // Nhà phố Nhà Bè
    { dealIdx: 6, propertyIdx: 18 },  // Scenic Valley
    { dealIdx: 7, propertyIdx: 5 },   // Shophouse Phú Mỹ Hưng
    { dealIdx: 8, propertyIdx: 9 },   // Imperium
    { dealIdx: 9, propertyIdx: 11 },  // Pegas Residence
    { dealIdx: 10, propertyIdx: 2 },  // Nhà phố Phú Mỹ
    { dealIdx: 11, propertyIdx: 6 },  // Đất Hương Lộ 2
    { dealIdx: 12, propertyIdx: 4 },  // Sunrise City
    { dealIdx: 13, propertyIdx: 1 },  // Masteri Millennium
    { dealIdx: 14, propertyIdx: 24 }, // Nhà phố Phú Xuân
  ];

  for (const link of dealPropertyLinks) {
    if (link.dealIdx < deals.length && link.propertyIdx < properties.length) {
      await prisma.dealProperty.create({
        data: {
          dealId: deals[link.dealIdx].id,
          propertyId: properties[link.propertyIdx].id,
        },
      });
    }
  }

  console.log('Created deal-customer and deal-property relations');

  // ==================== TASKS ====================
  const taskData = [
    { title: 'Gọi khách Trần Văn Hùng follow-up', type: 'call_customer', priority: 'high', status: 'pending', dueDate: daysFromNow(0), dueTime: '09:00', assignedTo: sales1.id },
    { title: 'Gửi báo giá căn hộ Sunrise City', type: 'followup', priority: 'high', status: 'pending', dueDate: daysFromNow(0), dueTime: '10:30', assignedTo: sales1.id },
    { title: 'Hẹn xem nhà Võ Hoàng Yến', type: 'call_customer', priority: 'high', status: 'pending', dueDate: daysFromNow(1), dueTime: '14:00', assignedTo: sales2.id },
    { title: 'Đăng bài Facebook căn hộ Vincom Riverside', type: 'post', priority: 'medium', status: 'pending', dueDate: daysFromNow(1), dueTime: '09:00', assignedTo: marketing.id },
    { title: 'Quay video walkthrough căn hộ Masteri', type: 'video', priority: 'medium', status: 'pending', dueDate: daysFromNow(2), dueTime: '10:00', assignedTo: marketing.id },
    { title: 'Khảo sát đất nền Nam Long', type: 'survey', priority: 'medium', status: 'pending', dueDate: daysFromNow(3), dueTime: '08:00', assignedTo: sales1.id },
    { title: 'Gọi chủ nhà Trần Đức Anh cập nhật giá', type: 'call_owner', priority: 'high', status: 'pending', dueDate: daysFromNow(0), dueTime: '15:00', assignedTo: sales1.id },
    { title: 'Chuẩn bị hợp đồng môi giới deal GD-003', type: 'document', priority: 'high', status: 'pending', dueDate: daysFromNow(1), dueTime: '11:00', assignedTo: assistant.id },
    { title: 'Nhận cọc deal GD-013', type: 'deposit', priority: 'high', status: 'pending', dueDate: daysFromNow(2), dueTime: '14:00', assignedTo: sales1.id },
    { title: 'Follow-up khách Nguyễn Thị Lan', type: 'followup', priority: 'medium', status: 'pending', dueDate: daysFromNow(2), dueTime: '10:00', assignedTo: sales1.id },
    { title: 'Cập nhật thông tin BĐS trên website', type: 'post', priority: 'low', status: 'pending', dueDate: daysFromNow(5), dueTime: '09:00', assignedTo: marketing.id },
    { title: 'Gọi khách Lê Minh Tuấn xác nhận nhu cầu', type: 'call_customer', priority: 'medium', status: 'pending', dueDate: daysFromNow(3), dueTime: '11:00', assignedTo: sales1.id },
    { title: 'Kiểm tra pháp lý sổ hồng SP-011', type: 'document', priority: 'medium', status: 'pending', dueDate: daysFromNow(4), dueTime: '09:00', assignedTo: assistant.id },
    { title: 'Gửi email tư vấn khách Hàn Quốc', type: 'followup', priority: 'high', status: 'pending', dueDate: daysFromNow(1), dueTime: '16:00', assignedTo: sales2.id },
    { title: 'Hẹn gặp chủ nhà Lê Thị Hoa', type: 'call_owner', priority: 'medium', status: 'pending', dueDate: daysFromNow(4), dueTime: '10:00', assignedTo: sales2.id },
    // Overdue tasks
    { title: 'Gọi follow-up khách Đỗ Thanh Sơn', type: 'call_customer', priority: 'high', status: 'overdue', dueDate: daysAgo(2), dueTime: '09:00', assignedTo: sales1.id },
    { title: 'Soạn hợp đồng thuê Vincom Riverside', type: 'document', priority: 'high', status: 'overdue', dueDate: daysAgo(1), dueTime: '14:00', assignedTo: assistant.id },
    { title: 'Đăng tin Zalo đất nền Nam Long', type: 'post', priority: 'medium', status: 'overdue', dueDate: daysAgo(3), dueTime: '09:00', assignedTo: marketing.id },
    // Completed tasks
    { title: 'Gửi hình ảnh căn hộ cho khách Võ Hoàng Yến', type: 'followup', priority: 'medium', status: 'completed', dueDate: daysAgo(1), dueTime: '10:00', assignedTo: sales2.id },
    { title: 'Xem nhà cùng khách Trương Thị Hạnh', type: 'call_customer', priority: 'high', status: 'completed', dueDate: daysAgo(2), dueTime: '14:00', assignedTo: sales1.id },
    { title: 'Cập nhật giá BĐS trên hệ thống', type: 'other', priority: 'low', status: 'completed', dueDate: daysAgo(3), dueTime: '16:00', assignedTo: assistant.id },
    { title: 'Đăng bài TikTok giới thiệu dự án', type: 'video', priority: 'medium', status: 'completed', dueDate: daysAgo(2), dueTime: '11:00', assignedTo: marketing.id },
    { title: 'Nhận cọc deal GD-004', type: 'deposit', priority: 'high', status: 'completed', dueDate: daysAgo(5), dueTime: '10:00', assignedTo: sales1.id },
    { title: 'Khảo sát nhà phố Phú Mỹ', type: 'survey', priority: 'medium', status: 'completed', dueDate: daysAgo(4), dueTime: '08:00', assignedTo: sales2.id },
    // More upcoming tasks
    { title: 'Gọi chủ nhà Nguyễn Minh Tâm cập nhật BĐS', type: 'call_owner', priority: 'medium', status: 'pending', dueDate: daysFromNow(5), dueTime: '10:00', assignedTo: sales1.id },
    { title: 'Hẹn xem nhà lần 2 khách Cao Thị Thúy', type: 'call_customer', priority: 'high', status: 'pending', dueDate: daysFromNow(3), dueTime: '15:00', assignedTo: sales2.id },
    { title: 'Lập báo cáo tuần marketing', type: 'other', priority: 'low', status: 'pending', dueDate: daysFromNow(5), dueTime: '17:00', assignedTo: marketing.id },
    { title: 'Chuẩn bị hồ sơ pháp lý SP-015', type: 'document', priority: 'medium', status: 'pending', dueDate: daysFromNow(6), dueTime: '09:00', assignedTo: assistant.id },
    { title: 'Quay video drone KDC Nam Long', type: 'video', priority: 'medium', status: 'pending', dueDate: daysFromNow(7), dueTime: '07:00', assignedTo: marketing.id },
    { title: 'Follow-up khách water quality Phùng Văn Hải', type: 'followup', priority: 'medium', status: 'pending', dueDate: daysFromNow(4), dueTime: '11:00', assignedTo: sales1.id },
    { title: 'Gọi khách Bạch Văn Tùng đàm phán giá', type: 'call_customer', priority: 'high', status: 'pending', dueDate: daysFromNow(1), dueTime: '09:30', assignedTo: sales1.id },
  ];

  const tasks = [];
  for (let i = 0; i < taskData.length; i++) {
    const t = taskData[i];
    const task = await prisma.task.create({
      data: {
        title: t.title,
        type: t.type,
        priority: t.priority,
        status: t.status,
        dueDate: t.dueDate,
        dueTime: t.dueTime || null,
        description: t.title,
        assignedTo: t.assignedTo,
        isRecurring: t.type === 'post' ? true : false,
        recurPattern: t.type === 'post' ? 'weekly' : null,
      },
    });
    tasks.push(task);
  }

  console.log(`Created ${tasks.length} tasks`);

  // Link some tasks to customers and owners
  const taskCustomerLinks = [
    { taskIdx: 0, customerIdx: 0 },
    { taskIdx: 1, customerIdx: 8 },
    { taskIdx: 2, customerIdx: 4 },
    { taskIdx: 9, customerIdx: 1 },
    { taskIdx: 11, customerIdx: 2 },
    { taskIdx: 13, customerIdx: 6 },
    { taskIdx: 15, customerIdx: 5 },
    { taskIdx: 18, customerIdx: 4 },
    { taskIdx: 19, customerIdx: 8 },
    { taskIdx: 25, customerIdx: 15 },
    { taskIdx: 29, customerIdx: 29 },
  ];

  for (const link of taskCustomerLinks) {
    if (link.taskIdx < tasks.length && link.customerIdx < customers.length) {
      try {
        await prisma.taskCustomer.create({
          data: {
            taskId: tasks[link.taskIdx].id,
            customerId: customers[link.customerIdx].id,
          },
        });
      } catch {
        // Skip if duplicate
      }
    }
  }

  const taskOwnerLinks = [
    { taskIdx: 6, ownerIdx: 0 },
    { taskIdx: 14, ownerIdx: 2 },
    { taskIdx: 24, ownerIdx: 1 },
  ];

  for (const link of taskOwnerLinks) {
    if (link.taskIdx < tasks.length && link.ownerIdx < owners.length) {
      await prisma.taskOwner.create({
        data: {
          taskId: tasks[link.taskIdx].id,
          ownerId: owners[link.ownerIdx].id,
        },
      });
    }
  }

  // Link some tasks to deals
  const taskDealLinks = [
    { taskIdx: 8, dealIdx: 12 },  // Nhận cọc GD-013
    { taskIdx: 7, dealIdx: 2 },   // Hợp đồng GD-003
  ];

  for (const link of taskDealLinks) {
    if (link.taskIdx < tasks.length && link.dealIdx < deals.length) {
      await prisma.taskDeal.create({
        data: {
          taskId: tasks[link.taskIdx].id,
          dealId: deals[link.dealIdx].id,
        },
      });
    }
  }

  console.log('Created task relations');

  // ==================== CAMPAIGNS ====================
  const campaignData = [
    { name: 'Căn hộ Quận 7 - T7/2025', channel: 'facebook', postDate: daysAgo(5), content: '🔥 Căn hộ 2PN Quận 7 - Giá chỉ từ 2.3 tỷ! Vị trí đắc địa, tiện ích đầy đủ. Liên hệ ngay!', propertyId: properties[1].id, cost: 500000, leadsGenerated: 12, viewingsGenerated: 5, dealsGenerated: 1, revenue: 64000000 },
    { name: 'Cho thuê Vincom Riverside', channel: 'zalo', postDate: daysAgo(3), content: '🏠 Cho thuê căn hộ 2PN Vincom Riverside - Full nội thất, giá tốt! View sông tuyệt đẹp.', propertyId: properties[0].id, cost: 200000, leadsGenerated: 8, viewingsGenerated: 3, dealsGenerated: 0, revenue: 0 },
    { name: 'Nhà phố Phú Mỹ Hưng', channel: 'facebook', postDate: daysAgo(7), content: '🏡 Nhà phố 1 trệt 2 lầu Phú Mỹ - 4PN, 3WC, sổ hồng chính chủ. Giá 5.5 tỷ!', propertyId: properties[2].id, cost: 300000, leadsGenerated: 6, viewingsGenerated: 2, dealsGenerated: 0, revenue: 0 },
    { name: 'Đất nền Nhà Bè - Đầu tư sinh lời', channel: 'tiktok', postDate: daysAgo(4), content: 'Video tour đất nền KDC Nam Long - Cơ hội đầu tư tuyệt vời tại Nhà Bè!', propertyId: properties[3].id, cost: 150000, leadsGenerated: 15, viewingsGenerated: 4, dealsGenerated: 0, revenue: 0 },
    { name: 'Shophouse Phú Mỹ Hưng - VIP', channel: 'website', postDate: daysAgo(10), content: 'Shophouse mặt tiền Nguyễn Văn Linh - Kinh doanh sầm uất, giá từ 12 tỷ', propertyId: properties[5].id, cost: 0, leadsGenerated: 3, viewingsGenerated: 1, dealsGenerated: 0, revenue: 0 },
    { name: 'Căn hộ Sunrise City cho thuê', channel: 'zalo', postDate: daysAgo(2), content: '🌟 Căn hộ 2PN Sunrise City - Nội thất châu Âu, giá chỉ 14 triệu/tháng!', propertyId: properties[4].id, cost: 100000, leadsGenerated: 10, viewingsGenerated: 4, dealsGenerated: 1, revenue: 15000000 },
    { name: 'Căn hộ 3PN Imperium', channel: 'facebook', postDate: daysAgo(6), content: '💎 Căn hộ 3PN Imperium - Full nội thất, view sông, giá 4.2 tỷ. Hot deal!', propertyId: properties[9].id, cost: 400000, leadsGenerated: 9, viewingsGenerated: 3, dealsGenerated: 0, revenue: 0 },
    { name: 'Đất Bình Chánh giá rẻ', channel: 'tiktok', postDate: daysAgo(8), content: 'Đất nền 5x20 Hương Lộ 2 - Sổ đỏ, giá chỉ 1.5 tỷ. Đầu tư ngay!', propertyId: properties[6].id, cost: 100000, leadsGenerated: 20, viewingsGenerated: 3, dealsGenerated: 0, revenue: 0 },
    { name: 'Scenic Valley cao cấp', channel: 'website', postDate: daysAgo(12), content: 'Căn hộ cao cấp Scenic Valley - Phú Mỹ Hưng. Dành cho khách VIP.', propertyId: properties[18].id, cost: 0, leadsGenerated: 4, viewingsGenerated: 2, dealsGenerated: 0, revenue: 0 },
    { name: 'The Crescent 3PN', channel: 'facebook', postDate: daysAgo(9), content: '🏢 Căn hộ 3PN The Crescent - View hồ, nội thất xịn, giá 5.8 tỷ!', propertyId: properties[19].id, cost: 350000, leadsGenerated: 7, viewingsGenerated: 2, dealsGenerated: 0, revenue: 0 },
    { name: 'Nhà phố Phú Xuân Nhà Bè', channel: 'zalo', postDate: daysAgo(1), content: '🏠 Nhà phố 4PN Phú Xuân - Nhà Bè. Sổ hồng, nội thất đầy đủ, giá 6.2 tỷ!', propertyId: properties[24].id, cost: 150000, leadsGenerated: 5, viewingsGenerated: 1, dealsGenerated: 0, revenue: 0 },
    { name: 'Tổng hợp BĐS Quận 7 T7', channel: 'listing', postDate: daysAgo(3), content: 'Tổng hợp các BĐS hot Quận 7 - Căn hộ, nhà phố, shophouse. Cập nhật mới nhất!', propertyId: null, cost: 500000, leadsGenerated: 18, viewingsGenerated: 6, dealsGenerated: 1, revenue: 76000000 },
  ];

  for (const c of campaignData) {
    await prisma.campaign.create({
      data: {
        name: c.name,
        channel: c.channel,
        postDate: c.postDate,
        content: c.content,
        propertyId: c.propertyId || null,
        cost: c.cost,
        leadsGenerated: c.leadsGenerated,
        viewingsGenerated: c.viewingsGenerated,
        dealsGenerated: c.dealsGenerated,
        revenue: c.revenue,
      },
    });
  }

  console.log(`Created ${campaignData.length} campaigns`);

  // ==================== KPI TARGETS ====================
  await prisma.kPITarget.create({
    data: {
      userId: sales1.id,
      period: period,
      revenueTarget: 5000000000, // 5 tỷ
      dealRentTarget: 5,
      dealSellTarget: 3,
      newCustomerTarget: 15,
      newOwnerTarget: 5,
      newPropertyTarget: 10,
      viewingTarget: 30,
      closingRateTarget: 0.25,
    },
  });

  await prisma.kPITarget.create({
    data: {
      userId: sales2.id,
      period: period,
      revenueTarget: 4000000000, // 4 tỷ
      dealRentTarget: 4,
      dealSellTarget: 2,
      newCustomerTarget: 12,
      newOwnerTarget: 4,
      newPropertyTarget: 8,
      viewingTarget: 25,
      closingRateTarget: 0.2,
    },
  });

  console.log('Created KPI targets');

  console.log('\n✅ Seed completed successfully!');
  console.log(`   Users: 5`);
  console.log(`   Customers: ${customers.length}`);
  console.log(`   Owners: ${owners.length}`);
  console.log(`   Properties: ${properties.length}`);
  console.log(`   Deals: ${deals.length}`);
  console.log(`   Tasks: ${tasks.length}`);
  console.log(`   Campaigns: ${campaignData.length}`);
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
