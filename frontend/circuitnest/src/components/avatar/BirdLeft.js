export function BirdLeft({ 
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
        viewBox="85 275 150 200"
        preserveAspectRatio="xMidYMax"
    >
        <g id="bird">
            <g>
                {/* Right leg */}
                <path style={{fill: legs}} d="M181.584,442.546l-8.078-2.503l-5.975-18.145c-0.278-0.846-1.193-1.307-2.035-1.026
                    c-0.846,0.278-1.305,1.189-1.027,2.034l5.629,17.092l-5.298,1.382c-0.861,0.225-1.377,1.105-1.152,1.967
                    c0.189,0.725,0.842,1.205,1.558,1.205c0.134,0,0.271-0.018,0.408-0.053l6.182-1.613l8.834,2.738
                    c0.159,0.05,0.319,0.073,0.478,0.073c0.688,0,1.325-0.444,1.538-1.136C182.909,443.712,182.434,442.81,181.584,442.546z"/>
                {/* Tail */}
                <path style={{fill: tail}} d="M29.848,407.848c-0.278,0.143-0.083,0.43,0.585,0.606c3.827,1.007,17.025,4.308,35.654,3.676
                    c17.827-0.604,28.32-3.528,28.32-3.528s-7.552-7.814-11.5-13.493c-3.192-4.593-6.152-10.98-6.152-10.98L53.79,395.549
                    l-10.934,5.616L29.848,407.848z"/>
                {/* Body */}
                <path style={{fill: body}} d="M99.483,357.606c-10.683,7.93-22.677,26.551-22.677,26.551s6.549,26.418,42.26,37.843
                    c15.188,4.86,36.259,4.284,48.042,1.522c22.713-5.323,36.637-18.131,45.224-34.298c1.095-2.061,3.173-7.512,3.173-7.512
                    s-12.563-23.844-21.212-30.134c-10.286-7.481-38.173-15.409-55.555-11.59C120.79,343.934,117.635,344.132,99.483,357.606z"/>
                {/* Left leg */}
                <path style={{fill: legs}} d="M150.834,445.836l-8.283-1.433l-8.692-21.989c-0.327-0.827-1.264-1.23-2.091-0.906
                    c-0.828,0.327-1.233,1.264-0.906,2.092l8.22,20.794l-6.308,1.772c-0.856,0.241-1.356,1.131-1.115,1.987
                    c0.2,0.711,0.846,1.177,1.55,1.177c0.145,0,0.291-0.02,0.437-0.061l6.91-1.941l9.729,1.683c0.093,0.016,0.186,0.023,0.277,0.023
                    c0.77,0,1.45-0.553,1.586-1.337C152.299,446.822,151.711,445.988,150.834,445.836z"/>
                <g>
                    {/* Head */}
                    <path style={{fill: head}} d="M220.229,343.642c-1.725-12.77-5.956-23.465-15.448-31.284c-9.492-7.819-16.808-8.19-25.196-8.045
                        c-11.124,0.193-26.217,7.01-34.636,18.702c-9.621,13.362-11.959,20.687-13.369,29.326c-2.233,13.698,0.268,24.466,6.043,31.921
                        c8.365,10.795,19.042,15.711,33.387,17.466c18.155,2.221,37.378-3.892,43.234-17.094
                        C220.187,371.238,221.955,356.412,220.229,343.642z"/>
                    {/* Hair */}
                    <path style={{fill: hair}} d="M207.366,314.685c0,0-6.878,1.269-15.675,0.666c-7.039-0.482-8.547-1.262-13.053-2.048
                        c-4.151-0.725-4.516,4.764-12.649,15.38c-12.152,15.863-21.625,19.169-21.625,19.169s-1.928,1.057-5.958,5.539
                        c-4.032,4.48-6.978,10.505-6.978,10.505s-1.96-11.021,3.02-22.266c4.345-9.811,6.271-15.463,17.082-25.988
                        c6.95-6.849,20.495-13.858,33.875-11.952C200.61,306.138,207.366,314.685,207.366,314.685z"/>
                    <g>
                        {/* Blush */}
                        <path style={{fill: blushes}} d="M182.211,339.222c0.298-3.123-2.635-5.959-6.551-6.332c-3.916-0.374-7.332,1.855-7.629,4.98
                            c-0.298,3.123,2.635,5.959,6.549,6.332C178.496,344.575,181.912,342.346,182.211,339.222z"/>
                        {/* Eye */}
                        <path style={{fill: eyes}} d="M189.305,328.583c0.242-2.533-1.584-4.78-4.081-5.018c-2.494-0.237-4.714,1.623-4.955,4.156
                            c-0.242,2.533,1.586,4.78,4.08,5.018C186.845,332.977,189.063,331.116,189.305,328.583z"/>
                        {/* Beak */}
                        <path style={{fill: beakTop}} d="M212.959,321.636l13.473,3.976l-8.227,8.066c0,0-2.696-0.68-5.017-2.123
                            c-4.046-2.515-4.78-3.389-4.78-3.389s0.604-1.837,2.467-4.355C211.898,322.426,212.959,321.636,212.959,321.636z"/>
                    </g>
                    {/* Beard */}
                    <g>
                        <path style={{fill: beard}} d="M180.78,393.012c-0.109,0-0.221-0.011-0.333-0.034c-0.876-0.184-1.438-1.042-1.255-1.918
                            l1.294-6.199c0.184-0.876,1.04-1.438,1.918-1.256c0.876,0.184,1.438,1.042,1.255,1.918l-1.294,6.199
                            C182.206,392.487,181.532,393.012,180.78,393.012z"/>
                        <path style={{fill: beard}} d="M190.071,395.643c-0.034,0-0.067-0.001-0.101-0.003c-0.894-0.056-1.573-0.824-1.518-1.718
                            l0.206-3.339c0.055-0.894,0.835-1.564,1.717-1.519c0.894,0.056,1.573,0.824,1.518,1.718l-0.206,3.339
                            C191.635,394.981,190.921,395.643,190.071,395.643z"/>
                        <path style={{fill: beard}} d="M210.535,380.951c-0.033,0-0.066-0.001-0.1-0.003c-0.894-0.055-1.574-0.822-1.52-1.717
                            l0.228-3.751c0.054-0.893,0.829-1.571,1.716-1.52c0.894,0.055,1.574,0.822,1.52,1.717l-0.228,3.75
                            C212.099,380.287,211.385,380.951,210.535,380.951z"/>
                        <path style={{fill: beard}} d="M167.44,381.811c-0.922-0.015-1.636-0.752-1.621-1.648l0.071-4.376
                            c0.014-0.886,0.737-1.595,1.62-1.595c0.922,0.015,1.636,0.752,1.621,1.648l-0.071,4.376
                            C169.046,381.102,168.323,381.811,167.44,381.811z"/>
                        <path style={{fill: beard}} d="M201.568,384.991c-0.941-0.025-1.646-0.771-1.621-1.667l0.09-3.222
                            c0.025-0.895,0.778-1.635,1.666-1.574c0.895,0.024,1.6,0.771,1.575,1.666l-0.09,3.222
                            C203.163,384.295,202.442,384.991,201.568,384.991z"/>
                    </g>
                </g>
                {/* Wings */}
                <path style={{fill: wings}} d="M125.377,337.329c7.52-3.894,13.496-4.767,13.496-4.767s11.197,8.018,9.852,22.57
                    c-1.324,12.95-8.02,22.218-20.561,27.782c-32.589,14.46-63.235,7.108-63.235,7.108s17.139-20.149,31.938-32.864
                    C112.67,343.591,117.238,341.544,125.377,337.329z"/>
            </g>
        </g>
    </svg>
}