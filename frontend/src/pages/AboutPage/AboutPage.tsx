const AboutPage = () => {
  return (
    <div className="container mx-auto px-4 py-12 md:py-16 lg:py-20 w-full">
      <h2 className="text-xl md:text-2xl font-bold ">About Us</h2>
      <hr className="border-black-50 mb-8 md:mb-12" />
      <div className="content w-20/24 mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-8 md:mb-12">
          Welcome to Bookworm
        </h1>
        <p className="text-lg text-center mb-10 md:mb-16 max-w-3xl mx-auto leading-relaxed">
          "Bookworm is an independent New York bookstore and language school
          with locations in Manhattan and Brooklyn. We specialize in travel
          books and language classes."
        </p>
        <div className="flex flex-col md:flex-row gap-8 md:gap-12 lg:gap-16">
          <div className="flex-1">
            <h2 className="text-2xl font-semibold mb-4">Our Story</h2>
            <p className="mb-4 leading-relaxed">
              The name Bookworm was taken from the original name for New York
              International Airport, which was renamed JFK in December 1963.
            </p>
            <p className="mb-4 leading-relaxed">
              Our Manhattan store has just moved to the West Village. Our new
              location is 170 7th Avenue South, at the corner of Perry Street.
            </p>
            <p className="leading-relaxed">
              From March 2008 through May 2016, the store was located in the
              Flatiron District.
            </p>
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-semibold mb-4">Our Vision</h2>
            <p className="mb-4 leading-relaxed">
              One of the last travel bookstores in the country, our Manhattan
              store carries a range of guidebooks (all 10% off) to suit the
              needs and tastes of every traveler and budget.
            </p>
            <p className="leading-relaxed">
              We believe that a novel or travelogue can be just as valuable a
              key to a place as any guidebook, and our well-read, well-traveled
              staff is happy to make reading recommendations for any traveler,
              book lover, or gift giver.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
