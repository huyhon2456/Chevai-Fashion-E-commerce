import React from 'react'
import Title from '../components/Title'
import { assets } from '../assets/assets'
import NewsSales from '../components/NewsSales'
const About = () => {
  return (
    
    <div >
      <div className='text-2xl text-center pt-8 border-t'>
        <Title  text2={'VỀ CHÚNG MÌNH'}/>
      </div>
      <div className='my-10 flex flex-col md:flex-row gap-16'>
        <img className='w-full md:max-w-[450px]' src={assets.about_img} alt="" />
        <div className='flex flex-col justify-center gap-6 md:w-2/4 text-gray-600'>
            <p>Tại Chevai, chúng mình tin rằng thời trang không chỉ là trang phục – đó là tuyên ngôn về sự tự tin và cá tính. Sứ mệnh của chúng mình là mang đến cho bạn những sản phẩm thời trang chất lượng cao, phong cách và giá cả phải chăng, phù hợp với phong cách sống của bạn. Với cam kết về tay nghề thủ công và tính bền vững, chúng mình đảm bảo rằng mỗi sản phẩm đều được thiết kế để giúp bạn trông và cảm thấy tuyệt vời nhất. Khám phá những bộ sưu tập mới nhất của chúng mình và cùng chúng mình định hình lại phong cách của bạn!</p>
            <p>Được thành lập với niềm đam mê thời trang, Chevai bắt đầu như một giấc mơ tạo ra những bộ trang phục kết hợp giữa sự thanh lịch, thoải mái và sự tự biểu đạt. Từ những ngày đầu khiêm tốn, chúng mình đã phát triển thành một thương hiệu đáng tin cậy, coi trọng chất lượng, đổi mới và sự hài lòng của khách hàng. Mỗi thiết kế mà chúng mình tạo ra đều được lấy cảm hứng từ những xu hướng mới nhất và được chế tác với sự chăm sóc. Hãy tham gia cùng chúng mình trong hành trình này và đón nhận một phong cách thực sự đại diện cho bạn!</p>
            <b className='text-gray-800'>Sứ Mệnh</b>
            <p>Sứ mệnh của chúng mình là trao quyền cho mọi người thông qua thời trang bằng cách cung cấp trang phục chất lượng cao, hợp thời trang và bền vững. Chúng mình nỗ lực tạo ra những thiết kế không chỉ bắt kịp xu hướng mà còn tôn vinh sự thoải mái, tự tin và thể hiện bản thân. Tại Chevai, chúng mình tin rằng mọi người đều xứng đáng được thể hiện và tỏa sáng nhất, bất kể trong hoàn cảnh nào.</p>
        </div>
      </div>
      <div className='text-4xl py-4'>
        <Title text2={'ĐẾN VỚI CHEVAI'}/>
      </div>
      <div className='flex flex-col md:flex-row text-sm mb-20'>
        <div className='border px-10 md:px-16 py-8 sm:py-20 flex flex-col gap-5'>
          <b>Đảm Bảo Chất Lượng</b>
          <p className='text-gray-600'>Tại Chevai, chất lượng là ưu tiên hàng đầu của chúng mình. Chúng mình cẩn thận chọn lựa các loại vải cao cấp và làm việc với những nghệ nhân lành nghề để đảm bảo mỗi sản phẩm đều đạt tiêu chuẩn cao nhất. Từ thiết kế đến sản xuất, quy trình kiểm soát chất lượng nghiêm ngặt của chúng mình đảm bảo độ bền, sự thoải mái và phong cách. Chúng mình cam kết mang đến thời trang không chỉ đẹp mà còn bền lâu.</p>
        </div>
        <div className='border px-10 md:px-16 py-8 sm:py-20 flex flex-col gap-5'>
          <b>Tiện Lợi</b>
          <p className='text-gray-600'>Tại Chevai, chúng mình ưu tiên sự tiện lợi cho việc mua sắm của bạn. Trang web thân thiện với người dùng, quy trình thanh toán liền mạch và nhiều tùy chọn thanh toán đảm bảo trải nghiệm mua sắm không gặp rắc rối. Với việc giao hàng nhanh chóng và dễ dàng trả hàng, chúng mình đảm bảo rằng thời trang chỉ cách bạn một cú nhấp chuột.</p>
        </div>
        <div className='border px-10 md:px-16 py-8 sm:py-20 flex flex-col gap-5'>
          <b>Dịch Vụ Khách Hàng Xuất Sắc</b>
          <p className='text-gray-600'>Tại Chevai, sự hài lòng của khách hàng là ưu tiên hàng đầu của chúng mình. Đội ngũ hỗ trợ tận tâm của chúng mình luôn sẵn sàng hỗ trợ bạn với bất kỳ thắc mắc nào, đảm bảo trải nghiệm mua sắm liền mạch. Từ những gợi ý cá nhân hóa đến việc trả hàng không gặp rắc rối, chúng mình luôn nỗ lực để bạn cảm thấy được trân trọng và chăm sóc.</p>
        </div>
      </div>
      <NewsSales/>
    </div>
  )
}
export default About