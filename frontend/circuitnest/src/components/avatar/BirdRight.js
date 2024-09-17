export function BirdRight({ 
    legs='#512F07', 
    wings='#B78029', 
    body='#FFD57F', 
    tail='#A87129',
    head='#FF993F', 
    hair='#B78029', 
    beard='#512F07', 
    blushes='#FFB69F', 
    eyes='#2B1806', 
    beakTop='#512F07', 
    beakBottom='#3A2107' 
}) {
    return <svg 
        version="1.1" 
        width='100%'
        height='50%'
        viewBox="285 45 150 200"
        preserveAspectRatio="xMidYMax"
    >
        <g id="bird">
            <g>
                {/* Left leg */}
                <path style={{fill: legs}} d="M349.627,184.387c-0.714-0.32-1.547-0.001-1.864,0.71l-9.165,20.435l-9.917,1.862
                    c-0.766,0.144-1.27,0.881-1.126,1.647c0.127,0.678,0.72,1.151,1.385,1.151c0.087,0,0.175-0.008,0.263-0.024l6.695-1.258
                    l-5.205,6.066c-0.507,0.591-0.439,1.482,0.152,1.99c0.267,0.229,0.593,0.34,0.918,0.34c0.397,0,0.793-0.167,1.072-0.492
                    l6.928-8.074l3.84,3.095c0.261,0.21,0.574,0.313,0.885,0.313c0.412,0,0.82-0.18,1.1-0.525c0.489-0.607,0.394-1.495-0.213-1.984
                    l-4.058-3.271l9.021-20.114C350.656,185.541,350.337,184.706,349.627,184.387z"/>
                {/* Tail */}
                <path style={{fill: tail}} d="M466.636,130.87c0.189-0.065,0.496-0.216,0.355,0.116c-0.764,1.797-3.392,9.488-11.933,19.086
                    c-15.481,17.396-32.397,26.005-32.397,26.005s-0.671-11.007,3.836-24.878c2.443-7.517,8.644-9.583,8.644-9.583L466.636,130.87z"/>
                {/* Body */}
                <path style={{fill: body}} d="M411.685,132.806c6.888,4.967,27.614,9.596,27.614,9.596s-0.911,12.023-8.79,24.194
                    c-2.884,4.455-5.94,8.294-10.193,11.41c-10.983,8.049-24.991,11.986-33.944,13.72c-14.417,2.79-32.472-1.01-42.787-5.232
                    c-19.882-8.139-30.685-21.807-36.147-37.756c-4.375-12.776,7.549-33.441,16.226-41.309c19.932-18.076,56.846-11.991,64.994,2.228
                    C394.973,120.674,398.809,123.521,411.685,132.806z"/>
                <g>
                    {/* Head */}
                    <path style={{fill: head}} d="M390.517,124.763c0.087-7.807-1.85-21.454-10.646-33.054
                        c-11.266-14.856-28.066-15.638-35.743-14.771c-2.207,0.249-6.288,1.36-8.641,2.216c-2.963,1.077-5.944,2.507-8.652,4.172
                        c-5.065,3.113-9.312,7.02-11.656,10.787c-4.592,7.381-10.805,20.247-10.518,35.798c0.414,22.36,6.736,28.662,18.014,33.727
                        c13.734,6.168,29.785,5.169,42.485,0.23C376.303,159.534,390.27,146.924,390.517,124.763z"/>
                    {/* Beard */}
                    <g>
                        <path style={{fill: beard}} d="M313.01,136.787c-0.063,0-0.128-0.004-0.193-0.013c-0.771-0.105-1.313-0.817-1.207-1.589
                            l0.697-5.099c0.105-0.771,0.811-1.312,1.59-1.207c0.771,0.105,1.313,0.817,1.207,1.589l-0.697,5.099
                            C314.31,136.275,313.705,136.787,313.01,136.787z"/>
                        <path style={{fill: beard}} d="M332.335,140.787c-0.779,0-1.411-0.632-1.411-1.411v-3.035c0-0.779,0.632-1.411,1.411-1.411
                            s1.411,0.632,1.411,1.411v3.035C333.746,140.156,333.114,140.787,332.335,140.787z"/>
                        <path style={{fill: beard}} d="M325.121,149.001c-0.749,0-1.373-0.589-1.408-1.345l-0.179-3.835
                            c-0.037-0.779,0.566-1.439,1.344-1.476c0.786-0.029,1.439,0.566,1.475,1.344l0.179,3.835c0.037,0.779-0.565,1.439-1.344,1.476
                            C325.165,149.001,325.143,149.001,325.121,149.001z"/>
                        <path style={{fill: beard}} d="M341.095,137.717c-0.662,0-1.253-0.468-1.384-1.143l-0.768-3.958
                            c-0.148-0.765,0.352-1.505,1.117-1.654c0.759-0.148,1.506,0.351,1.654,1.117l0.768,3.958c0.147,0.765-0.352,1.505-1.117,1.654
                            C341.275,137.708,341.185,137.717,341.095,137.717z"/>
                    </g>
                    <g>
                        {/* Blush */}
                        <path style={{fill: blushes}} d="M362.417,104.645c0-2.89-2.937-5.232-6.559-5.232s-6.559,2.342-6.559,5.232
                            c0,2.89,2.936,5.232,6.559,5.232S362.417,107.535,362.417,104.645z"/>
                        {/* Eye */}
                        <path style={{fill: eyes}} d="M350.319,92.987c0-2.344-1.871-4.243-4.18-4.243c-2.309,0-4.18,1.899-4.18,4.243
                            c0,2.342,1.871,4.243,4.18,4.243C348.448,97.23,350.319,95.329,350.319,92.987z"/>
                        {/* Beak */}
                        <path style={{fill: beakTop}} d="M313.626,78.154l13.209,5.172c0,0,0.489,1.12,0.644,2.752c0.249,2.634-0.225,3.869-0.225,3.869
                            s-2.046,0.922-5.573,1.746c-3.032,0.707-5.187,0.548-5.187,0.548L313.626,78.154z"/>
                    </g>
                    {/* Hair */}
                    <path style={{fill: hair}} d="M344.134,76.937c0,0,1.748,3.449,10.946,7.563c6.338,2.835,10.841,2.167,11.675,3.502
                        c0.834,1.335-0.333,7.839,7.672,17.679c8.006,9.841,16.011,12.842,16.011,12.842s-1.625-19.361-12.079-30.053
                        C364.126,73.914,344.134,76.937,344.134,76.937z"/>
                </g>
                {/* Right leg */}
                <path style={{fill: legs}} d="M397.595,213.008l-5.821-3.475l-1.277-20.477c-0.049-0.778-0.708-1.37-1.496-1.32
                    c-0.777,0.048-1.369,0.718-1.32,1.496l1.276,20.476l-7.672,5.985c-0.614,0.479-0.724,1.366-0.244,1.981
                    c0.278,0.356,0.693,0.543,1.113,0.543c0.304,0,0.609-0.098,0.867-0.298l6.379-4.977l1.437,8.88
                    c0.111,0.693,0.711,1.186,1.391,1.186c0.075,0,0.151-0.006,0.228-0.018c0.77-0.124,1.292-0.849,1.167-1.619l-1.335-8.244
                    l3.86,2.304c0.227,0.135,0.477,0.2,0.723,0.2c0.48,0,0.948-0.245,1.213-0.688C398.483,214.274,398.264,213.408,397.595,213.008z"
                    />
                {/* Wings */}
                <path style={{fill: wings}} d="M387.501,106.451c0,0-11.058,8.604-10.391,22.041c0.564,7.216,2.509,15.109,12.917,21.646
                    c8.823,5.542,26.152,5.962,36.437,2.622c11.164-3.625,23.257-16.118,23.257-16.118s-16.763,1.295-31.362-5.928
                    C400.266,121.76,387.501,106.451,387.501,106.451z"/>
            </g>
        </g>
    </svg>
}