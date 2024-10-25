import React from "react"
import NotFoundPage from "@agir/front/notFoundPage/NotFoundPage";
import {useIsOffline} from "@agir/front/offline/hooks";

import PropTypes from "prop-types";

const NotFoundWrapper = ({data, error, title, children}) =>  {
    const isOffline = useIsOffline();

    if ([403, 404].includes(error?.response?.status) ||
        (isOffline && !data)
    ) {
        return <NotFoundPage
            hasTopBar={false}
            title={title}
            subtitle={title}
        />
    }
    return children
}

NotFoundWrapper.propTypes = {
    data: PropTypes.object,
    error: PropTypes.object,
    title: PropTypes.string.isRequired,
    children: PropTypes.element.isRequired
}


export default NotFoundWrapper