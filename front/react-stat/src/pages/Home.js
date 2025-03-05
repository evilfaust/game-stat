import { Layout } from "antd";
import NavigationCards from "../components/NavigationCards";


const Home = () => {

    return (
        <>
            <Layout>
                <Layout.Content>
                    <NavigationCards />
                </Layout.Content>
            </Layout>
        </>
    )
}

export default Home;